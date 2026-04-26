'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './Search.module.css';
import ProductCard from '@/app/components/ProductCard';
import { ProductSchema } from '../../types/database';
import { fetchAllProducts, read_query } from '@/services/firebase/firestore';
import Navbar from '../components/Navbar';
import { useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';

const CATEGORIES = ["All", "Dairy", "Fruits", "Vegetables", "Groceries", "Beverages"];

const SearchPage: React.FC = () => {
    const searchParams = useSearchParams();
    const queryFromUrl = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(queryFromUrl);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ProductSchema[]>([]);

    const [allProducts, setAllProducts] = useState<ProductSchema[]>([])
    const [filteredResults, setFilteredResults] = useState<ProductSchema[]>([]);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        };
        console.log('Searching for:', searchQuery);
        setLoading(true);
        try {
            // Calling the Firestore service function
            const data = await read_query(searchQuery);
            console.log(data);
            setResults(data || []);

        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }

    };

    // Filtered & Sorted Products
    // Live Search + Filters + Sorting
    const filteredProducts = useMemo(() => {
        let result = [...results];

        const parsePrice = (val: any): number => {
            if (!val) return 0;
            return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
        };

        // Filter products based on search query + sidebar filters
        result = result.filter(product => {
            // Search Query (Live Search)
            const matchesSearch = !searchQuery.trim() ||
                product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.about_product?.toLowerCase().includes(searchQuery.toLowerCase());

            // Category Filter
            const matchesCategory =
                selectedCategory === 'All' ||
                product.category?.toLowerCase().includes(selectedCategory.toLowerCase());

            // Price Filter
            const priceToCheck = parsePrice(product.discounted_price || product.actual_price);
            const matchesPrice = priceToCheck >= priceRange[0] && priceToCheck <= priceRange[1];

            // Rating Filter
            const matchesRating = parseFloat(String(product.rating) || '0') >= minRating;

            return matchesSearch && matchesCategory && matchesPrice && matchesRating;
        });

        // Sorting
        if (sortBy === 'price-low') {
            result.sort((a, b) =>
                parsePrice(a.discounted_price || a.actual_price) -
                parsePrice(b.discounted_price || b.actual_price)
            );
        } else if (sortBy === 'price-high') {
            result.sort((a, b) =>
                parsePrice(b.discounted_price || b.actual_price) -
                parsePrice(a.discounted_price || a.actual_price)
            );
        } else if (sortBy === 'rating') {
            result.sort((a, b) =>
                parseFloat(String(b.rating)) - parseFloat(String(a.rating))
            );
        }
        // 'relevance' keeps the original order from Firestore

        return result;
    }, [results, searchQuery, selectedCategory, priceRange, minRating, sortBy]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setPriceRange([0, 200]);
        setMinRating(0);
        setSortBy('relevance');
    };
    useEffect(() => {
        setSearchQuery(queryFromUrl);
        if (queryFromUrl) {
            handleSearch(queryFromUrl);
        }
    }, [queryFromUrl]);

    useEffect(() => {
        const loadProducts = async () => {
            // In a portfolio, fetching 1500 small objects is fine (approx 200-500kb)
            const data = await fetchAllProducts();
            setAllProducts(data);
        };
        loadProducts();
    }, []);
    useEffect(() => {
        if (allProducts.length > 0) {
            if (!queryFromUrl) {
                setFilteredResults(allProducts);
                return;
            }

            const fuse = new Fuse(allProducts, {
                keys: ['name', 'category', 'description'],
                threshold: 0.3, // Lower is stricter, 0.3 is great for typos
            });

            const results = fuse.search(queryFromUrl).map(result => result.item);
            setFilteredResults(results);
        }
    }, [queryFromUrl, allProducts]);

    return (
        <>
            <Navbar />
            <div className={styles.page}>
                {/* Top Search Bar */}
                <div className={styles.searchHeader}>
                    <div className={styles.searchContainer}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search for milk, eggs, veggies, fruits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)} // Optional: Enter key support
                        />
                        <button
                            type="button"
                            onClick={() => handleSearch(searchQuery)}
                            className={styles.searchBtn}
                        >
                            Search
                        </button>
                    </div>

                    <div className={styles.sortContainer}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className={styles.sortSelect}
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Customer Rating</option>
                        </select>
                    </div>
                </div>

                <div className={styles.mainContent}>
                    {/* Sidebar Filters */}
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <h2>Filters</h2>
                            <button onClick={clearFilters} className={styles.clearBtn}>Clear all</button>
                        </div>

                        {/* Categories */}
                        <div className={styles.filterSection}>
                            <h3>Category</h3>
                            <div className={styles.checkboxGroup}>
                                {CATEGORIES.map(cat => (
                                    <label key={cat} className={styles.checkboxLabel}>
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                        />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className={styles.filterSection}>
                            <h3>Price Range</h3>
                            <div className={styles.priceInputs}>
                                <input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    className={styles.priceInput}
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    className={styles.priceInput}
                                />
                            </div>
                        </div>

                        {/* Minimum Rating */}
                        <div className={styles.filterSection}>
                            <h3>Minimum Rating</h3>
                            <div className={styles.ratingOptions}>
                                {[4, 3, 2, 1].map(r => (
                                    <label key={r} className={styles.checkboxLabel}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={minRating === r}
                                            onChange={() => setMinRating(r)}
                                        />
                                        {r}+ Stars
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Listing */}
                    <div className={styles.results}>
                        <div className={styles.resultsHeader}>
                            <p>{filteredProducts.length} products found</p>
                        </div>

                        <div className={styles.productGrid}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <ProductCard key={product.product_id} product={product} />
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    <p>No products found matching your criteria.</p>
                                    <button onClick={clearFilters}>Clear filters</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchPage;