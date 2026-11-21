'use client';

import Fuse, { IFuseOptions } from 'fuse.js';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import styles from './Search.module.css';
import { fetchAllProducts } from '@/services/firebase/firestore';
import { ProductSchema } from '@/types/database';
import LoadingSpinner from '../components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';
import ProductDetailModal from '../components/ProductDetailModal';

const ALL_CATEGORIES = 'All';

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-asc', label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'name', label: 'Name A–Z' },
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

const FUSE_OPTIONS: IFuseOptions<ProductSchema> = {
    keys: [
        { name: 'product_name', weight: 0.7 },
        { name: 'category', weight: 0.3 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 1,
};

/** "₹1,099", "4.2", "64%" -> 1099, 4.2, 64. Returns NaN when there is no number. */
function parseNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return NaN;
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : NaN;
}

const getPrice = (p: ProductSchema) => parseNumber(p.discounted_price);

/** Missing or unparsable ratings count as 0 */
const getRating = (p: ProductSchema) => {
    const rating = parseNumber(p.rating);
    return Number.isNaN(rating) ? 0 : rating;
};

/** "Computers&Accessories|Cables|USBCables" -> "Computers&Accessories" (top-level category) */
const getTopCategory = (category: string) => category?.split('|')[0]?.trim() ?? '';

/** "Computers&Accessories" -> "Computers & Accessories", "HomeImprovement" -> "Home Improvement" */
const formatCategory = (category: string) =>
    category.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s*&\s*/g, ' & ');

function renderStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export default function SearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get('q') ?? '';

    const [allProducts, setAllProducts] = useState<ProductSchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [inputValue, setInputValue] = useState(initialQuery);
    const [activeQuery, setActiveQuery] = useState(initialQuery);
    const [category, setCategory] = useState<string>(ALL_CATEGORIES);
    const [sortBy, setSortBy] = useState<SortValue>('relevance');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [minRating, setMinRating] = useState<number>(0);
    const [, startTransition] = useTransition();

    // Product detail modal
    const [selectedProduct, setSelectedProduct] = useState<ProductSchema | null>(null);
    const closeModal = useCallback(() => setSelectedProduct(null), []);

    const relatedProducts = useMemo(() => {
        if (!selectedProduct) return [];
        const top = getTopCategory(selectedProduct.category);
        return allProducts
            .filter((p) => p.product_id !== selectedProduct.product_id && getTopCategory(p.category) === top)
            .slice(0, 4);
    }, [selectedProduct, allProducts]);

    useEffect(() => {
        fetchAllProducts()
            .then((products) => {
                setAllProducts(products);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('❌ [FETCH] fetchAllProducts threw an error:', error);
                setIsLoading(false);
            });
    }, []);

    const fuse = useMemo(() => {
        if (allProducts.length === 0) {
            return new Fuse([], FUSE_OPTIONS);
        }
        return new Fuse(allProducts, FUSE_OPTIONS);
    }, [allProducts]);

    // Products matching the text query (before category/price/rating filters)
    const searchPool = useMemo<ProductSchema[]>(() => {
        if (activeQuery.trim().length > 0) {
            return fuse.search(activeQuery).map((r) => r.item);
        }
        return allProducts;
    }, [activeQuery, fuse, allProducts]);

    // Categories come from the data itself: top-level segment of `category`, biggest first
    const categoryOptions = useMemo(() => {
        const totals = new Map<string, number>();
        allProducts.forEach((p) => {
            const top = getTopCategory(p.category);
            if (top) totals.set(top, (totals.get(top) ?? 0) + 1);
        });

        const counts = new Map<string, number>();
        searchPool.forEach((p) => {
            const top = getTopCategory(p.category);
            if (top) counts.set(top, (counts.get(top) ?? 0) + 1);
        });

        const keys = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key);

        return [
            { key: ALL_CATEGORIES, label: ALL_CATEGORIES, count: searchPool.length },
            ...keys.map((key) => ({ key, label: formatCategory(key), count: counts.get(key) ?? 0 })),
        ];
    }, [allProducts, searchPool]);

    const results = useMemo<ProductSchema[]>(() => {
        let pool = [...searchPool];

        // Category filter
        if (category !== ALL_CATEGORIES) {
            pool = pool.filter((p) => getTopCategory(p.category) === category);
        }

        // Price filter (on the discounted price)
        const min = minPrice !== '' ? Number(minPrice) : -Infinity;
        const max = maxPrice !== '' ? Number(maxPrice) : Infinity;
        pool = pool.filter((p) => {
            const price = getPrice(p);
            return !Number.isNaN(price) && price >= min && price <= max;
        });

        // Minimum rating filter
        pool = pool.filter((p) => getRating(p) >= minRating);

        // Sort
        const sorted = [...pool];
        switch (sortBy) {
            case 'price-asc': sorted.sort((a, b) => getPrice(a) - getPrice(b)); break;
            case 'price-desc': sorted.sort((a, b) => getPrice(b) - getPrice(a)); break;
            case 'name': sorted.sort((a, b) => a.product_name.localeCompare(b.product_name)); break;
            case 'rating': sorted.sort((a, b) => getRating(b) - getRating(a)); break;
        }

        return sorted;
    }, [searchPool, category, minPrice, maxPrice, minRating, sortBy]);

    const applyQuery = useCallback((q: string) => {
        setActiveQuery(q);
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (q) params.set('q', q);
            else params.delete('q');
            router.replace(`?${params.toString()}`, { scroll: false });
        });
    }, [router, searchParams]);

    const handleSearch = useCallback(() => applyQuery(inputValue.trim()), [applyQuery, inputValue]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // The search box's "x" (or deleting all the text) shows all products again
        if (value === '' && activeQuery !== '') applyQuery('');
    }, [activeQuery, applyQuery]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    }, [handleSearch]);

    const clearAll = useCallback(() => {
        setInputValue('');
        setActiveQuery('');
        setCategory(ALL_CATEGORIES);
        setMinPrice('');
        setMaxPrice('');
        setMinRating(0);
        setSortBy('relevance');
        router.replace('?', { scroll: false });
    }, [router]);

    const activeFilterTags = useMemo(() => {
        const tags: { key: string; label: string; remove: () => void }[] = [];
        if (category !== ALL_CATEGORIES) {
            tags.push({ key: 'cat', label: formatCategory(category), remove: () => setCategory(ALL_CATEGORIES) });
        }
        if (minPrice !== '') tags.push({ key: 'min', label: `Min ₹${minPrice}`, remove: () => setMinPrice('') });
        if (maxPrice !== '') tags.push({ key: 'max', label: `Max ₹${maxPrice}`, remove: () => setMaxPrice('') });
        if (minRating > 0) tags.push({ key: 'rating', label: `${minRating}+ stars`, remove: () => setMinRating(0) });
        return tags;
    }, [category, minPrice, maxPrice, minRating]);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className={styles.loadingContainer}>
                    <LoadingSpinner />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Toaster position="top-right" reverseOrder={false} />
            <main className={styles.page}>
                <header className={styles.searchHeader}>
                    <div className={styles.searchContainer}>
                        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
                        <input
                            type="search"
                            className={styles.searchInput}
                            placeholder="Search for products, categories…"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            aria-label="Search products"
                        />

                        <button className={styles.searchBtn} onClick={handleSearch}>Search</button>
                    </div>
                    <div className={styles.sortContainer}>
                        <select
                            className={styles.sortSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortValue)}
                            aria-label="Sort products"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className={styles.mainContent}>
                    <aside className={styles.sidebar} aria-label="Filters">
                        <div className={styles.sidebarHeader}>
                            <h2 className={styles.sidebarTitle}>Filters</h2>
                            {activeFilterTags.length > 0 && (
                                <button className={styles.clearBtn} onClick={clearAll}>Clear all</button>
                            )}
                        </div>
                        <section className={styles.filterSection}>
                            <p className={styles.filterTitle}>Category</p>
                            <div className={styles.categoryList}>
                                {categoryOptions.map((option) => (
                                    <button
                                        key={option.key}
                                        className={`${styles.categoryBtn} ${category === option.key ? styles.activeCategory : ''}`}
                                        onClick={() => setCategory(option.key)}
                                        aria-pressed={category === option.key}
                                    >
                                        {option.label}
                                        <span className={styles.categoryCount}>{option.count}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                        <section className={styles.filterSection}>
                            <p className={styles.filterTitle}>Price Range (₹)</p>
                            <div className={styles.priceInputs}>
                                <input type="number" className={styles.priceInput} placeholder="Min" value={minPrice} min={0} onChange={(e) => setMinPrice(e.target.value)} aria-label="Minimum price" />
                                <span className={styles.priceSep}>–</span>
                                <input type="number" className={styles.priceInput} placeholder="Max" value={maxPrice} min={0} onChange={(e) => setMaxPrice(e.target.value)} aria-label="Maximum price" />
                            </div>
                        </section>
                        <section className={styles.filterSection}>
                            <p className={styles.filterTitle}>Minimum Rating</p>
                            <div className={styles.ratingOptions} role="radiogroup" aria-label="Minimum rating">
                                {[0, 3, 4, 4.5].map((val) => (
                                    <label key={val} className={styles.ratingLabel}>
                                        <input type="radio" name="minRating" value={val} checked={minRating === val} onChange={() => setMinRating(val)} />
                                        {val === 0 ? 'Any rating' : <><span className={styles.stars}>{renderStars(val)}</span><span className={styles.ratingText}>&amp; up</span></>}
                                    </label>
                                ))}
                            </div>
                        </section>
                    </aside>

                    <section>
                        <div className={styles.resultsHeader}>
                            <p className={styles.resultsCount}>
                                {activeQuery
                                    ? <><strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for &ldquo;{activeQuery}&rdquo;</>
                                    : <><strong>{results.length}</strong> product{results.length !== 1 ? 's' : ''}</>
                                }
                            </p>
                        </div>
                        {activeFilterTags.length > 0 && (
                            <div className={styles.activeFilters} aria-label="Active filters">
                                {activeFilterTags.map((tag) => (
                                    <span key={tag.key} className={styles.filterTag}>
                                        {tag.label}
                                        <button className={styles.filterTagRemove} onClick={tag.remove} aria-label={`Remove filter: ${tag.label}`}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className={styles.productGrid}>
                            {results.length > 0 ? (
                                results.map((product) => (
                                    <ProductCard key={product.product_id} product={product} onOpen={setSelectedProduct} />
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    <span className={styles.noResultsIcon} aria-hidden="true">🛒</span>
                                    <p className={styles.noResultsTitle}>No products found</p>
                                    <p className={styles.noResultsText}>Try adjusting your search term or filters.</p>
                                    <button className={styles.noResultsReset} onClick={clearAll}>Clear all filters</button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <ProductDetailModal
                product={selectedProduct}
                onClose={closeModal}
                relatedProducts={relatedProducts}
                onSelectProduct={setSelectedProduct}
            />
        </>
    );
}