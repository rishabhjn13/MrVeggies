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

const CATEGORIES = ['All', 'Dairy', 'Fruits', 'Vegetables', 'Groceries', 'Beverages'] as const;

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

function renderStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

const SearchPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get('q') ?? '';

    const [allProducts, setAllProducts] = useState<ProductSchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [inputValue, setInputValue] = useState(initialQuery);
    const [activeQuery, setActiveQuery] = useState(initialQuery);
    const [category, setCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<SortValue>('relevance');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [minRating, setMinRating] = useState<number>(0);
    const [, startTransition] = useTransition();

    useEffect(() => {
        console.log('🚀 [FETCH] Starting fetchAllProducts...');
        fetchAllProducts()
            .then((products) => {
                console.log(`✅ [FETCH] Got ${products.length} products`);

                if (products.length === 0) {
                    console.warn('⚠️ [FETCH] Firestore returned an EMPTY array. Check your collection name and Firestore rules.');
                    return;
                }

                // Log the first product's raw shape — this is the most important log
                console.log('🔍 [FETCH] First product raw object:', JSON.stringify(products[0], null, 2));

                // Check if expected fields exist
                const first = products[0];
                console.log('🔍 [FETCH] Field check on first product:');
                console.log('  product_name:', first.product_name, '| type:', typeof first.product_name);
                console.log('  category:', first.category, '| type:', typeof first.category);
                console.log('  actual_price:', first.actual_price, '| type:', typeof first.actual_price);
                console.log('  rating:', first.rating, '| type:', typeof first.rating);

                // Check for undefined fields — most common bug when Firestore field names differ
                if (!first.product_name) console.error('❌ [FETCH] product_name is undefined/null on first product! Fuse will find nothing.');
                if (!first.category) console.warn('⚠️ [FETCH] category is undefined/null on first product.');
                if (first.actual_price === undefined) console.error('❌ [FETCH] actual_price is undefined on first product! Price filter will break.');

                setAllProducts(products);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('❌ [FETCH] fetchAllProducts threw an error:', error);
                setIsLoading(false);
            });
    }, []);

    const fuse = useMemo(() => {
        console.log(`🔧 [FUSE] Rebuilding index with ${allProducts.length} products`);
        if (allProducts.length === 0) {
            console.warn('⚠️ [FUSE] allProducts is empty — index will be empty. Search will always return 0 results.');
            return new Fuse([], FUSE_OPTIONS);
        }

        const instance = new Fuse(allProducts, FUSE_OPTIONS);

        // Probe the fuse index with a known product name to verify it works
        const probe = allProducts[0].product_name;
        if (probe) {
            const probeResults = instance.search(probe.slice(0, 5)); // search first 5 chars
            console.log(`🔧 [FUSE] Probe search for "${probe.slice(0, 5)}" returned ${probeResults.length} results`);
            if (probeResults.length === 0) {
                console.error('❌ [FUSE] Probe search returned 0 results even for a known product name! The Fuse key is likely wrong.');
                console.error('❌ [FUSE] Keys configured:', FUSE_OPTIONS.keys);
                console.error('❌ [FUSE] Actual keys on product:', Object.keys(allProducts[0]));
            }
        } else {
            console.error('❌ [FUSE] product_name on first product is falsy — Fuse has nothing to index!');
        }

        return instance;
    }, [allProducts]);

    const results = useMemo<ProductSchema[]>(() => {
        console.log(`\n📦 [RESULTS] Computing results...`);
        console.log(`  activeQuery: "${activeQuery}"`);
        console.log(`  allProducts.length: ${allProducts.length}`);
        console.log(`  category: ${category}`);
        console.log(`  minPrice: ${minPrice}, maxPrice: ${maxPrice}`);
        console.log(`  minRating: ${minRating}`);

        let pool: ProductSchema[];

        if (activeQuery.trim().length > 0) {
            const fuseResults = fuse.search(activeQuery);
            console.log(`  🔍 Fuse search for "${activeQuery}" → ${fuseResults.length} raw results`);
            if (fuseResults.length > 0) {
                console.log('  🔍 Top 3 Fuse results:', fuseResults.slice(0, 3).map(r => ({
                    name: r.item.product_name,
                    score: r.score,
                })));
            } else {
                console.warn(`  ⚠️ Fuse returned 0 results for "${activeQuery}". Possible causes:`);
                console.warn('     1. product_name field is missing/undefined in Firestore docs');
                console.warn('     2. threshold is too strict (current: 0.35)');
                console.warn('     3. allProducts was empty when Fuse was built');
            }
            pool = fuseResults.map((r) => r.item);
        } else {
            pool = [...allProducts];
            console.log(`  📋 No query — using all ${pool.length} products`);
        }

        // Category filter
        if (category !== 'All') {
            const before = pool.length;
            pool = pool.filter((p) => p.category === category);
            console.log(`  🏷️ Category filter "${category}": ${before} → ${pool.length}`);
            if (pool.length === 0) {
                console.warn(`  ⚠️ Category filter wiped all results. Sample categories in data:`,
                    [...new Set(allProducts.slice(0, 20).map(p => p.category))]
                );
            }
        }

        // Price filter
        const min = minPrice !== '' ? Number(minPrice) : -Infinity;
        const max = maxPrice !== '' ? Number(maxPrice) : Infinity;
        const beforePrice = pool.length;
        pool = pool.filter((p) => {
            const price = typeof p.actual_price === 'string'
                ? Number(String(p.actual_price).replace(/[^0-9.]/g, ''))
                : p.actual_price;
            return price >= min && price <= max;
        });
        if (pool.length !== beforePrice) {
            console.log(`  💰 Price filter [${min}, ${max}]: ${beforePrice} → ${pool.length}`);
        }

        // Rating filter
        if (minRating > 0) {
            const beforeRating = pool.length;
            pool = pool.filter((p) => p.rating >= minRating);
            console.log(`  ⭐ Rating filter ≥${minRating}: ${beforeRating} → ${pool.length}`);
            if (pool.length === 0) {
                console.warn('  ⚠️ Rating filter wiped all results. Sample ratings in data:',
                    allProducts.slice(0, 10).map(p => p.rating)
                );
            }
        }

        // Sort
        const sorted = [...pool];
        switch (sortBy) {
            case 'price-asc': sorted.sort((a, b) => a.actual_price - b.actual_price); break;
            case 'price-desc': sorted.sort((a, b) => b.actual_price - a.actual_price); break;
            case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
            case 'name': sorted.sort((a, b) => a.product_name.localeCompare(b.product_name)); break;
        }

        console.log(`✅ [RESULTS] Final result count: ${sorted.length}`);
        return sorted;
    }, [activeQuery, fuse, allProducts, category, minPrice, maxPrice, minRating, sortBy]);

    // ... rest of handlers unchanged

    const categoryCounts = useMemo(() => {
        const base: ProductSchema[] =
            activeQuery.trim().length > 0
                ? fuse.search(activeQuery).map((r) => r.item)
                : allProducts;

        return CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
            acc[cat] = cat === 'All'
                ? base.length
                : base.filter((p) => p.category === cat).length;
            return acc;
        }, {});
    }, [activeQuery, allProducts, fuse]);

    const handleSearch = useCallback(() => {
        const q = inputValue.trim();
        console.log(`🔎 [SEARCH] handleSearch called with: "${q}"`);
        setActiveQuery(q);
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (q) params.set('q', q);
            else params.delete('q');
            router.replace(`?${params.toString()}`, { scroll: false });
        });
    }, [inputValue, router, searchParams]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    }, [handleSearch]);

    const clearAll = useCallback(() => {
        setInputValue('');
        setActiveQuery('');
        setCategory('All');
        setMinPrice('');
        setMaxPrice('');
        setMinRating(0);
        setSortBy('relevance');
        router.replace('?', { scroll: false });
    }, [router]);

    const activeFilterTags = useMemo(() => {
        const tags: { key: string; label: string; remove: () => void }[] = [];
        if (category !== 'All') tags.push({ key: 'cat', label: category, remove: () => setCategory('All') });
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
                            placeholder="Search for groceries, snacks, drinks…"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            aria-label="Search products"
                        />
                        {inputValue.length > 0 && (
                            <button
                                className={styles.clearInputBtn}
                                onClick={() => { setInputValue(''); setActiveQuery(''); }}
                                aria-label="Clear search"
                            >✕</button>
                        )}
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
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`${styles.categoryBtn} ${category === cat ? styles.activeCategory : ''}`}
                                        onClick={() => setCategory(cat)}
                                        aria-pressed={category === cat}
                                    >
                                        {cat}
                                        <span className={styles.categoryCount}>{categoryCounts[cat] ?? 0}</span>
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
                                    <ProductCard key={product.id} product={product} />
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
        </>
    );
};

export default SearchPage;