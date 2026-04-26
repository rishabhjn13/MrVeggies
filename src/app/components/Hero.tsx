'use client';

import React, { useState } from "react";
import styles from "./Hero.module.css";
import "../../styles/animations.css";
import { useRouter } from "next/navigation";

const LIVE_ACTIVITY = [
    "Priya just ordered in Koramangala!",
    "Rahul just ordered in Bandra!",
    "Sneha just ordered in Powai!",
];

const DELIVERY_ITEMS = [
    { emoji: "🥛", name: "Full-fat Milk 1L", price: "₹68" },
    { emoji: "🥚", name: "Farm Eggs (12)", price: "₹89" },
    { emoji: "🍌", name: "Bananas 500g", price: "₹35" },
];

const Hero: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activityIndex] = useState(0);

    const router = useRouter();
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <section className={styles.hero}>
            {/* ── Left: Copy ── */}
            <div className={styles.left}>
                <div className={styles.badge}>
                    <span className={styles.badgeDot} />
                    Delivering in 10 minutes
                </div>

                <h1 className={styles.heading}>
                    Groceries at<br />
                    your door, <em className={styles.headingEm}>instantly.</em>
                </h1>

                <p className={styles.subheading}>
                    Fresh produce, daily essentials, and household items — delivered
                    before you finish making your coffee.
                </p>

                <form className={styles.searchBar} onSubmit={handleSearch}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search for milk, eggs, veggies…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        aria-label="Search products"
                    />
                    <button type="submit" className={styles.searchBtn}>
                        Search
                    </button>
                </form>

                <div className={styles.stats}>
                    {[
                        { num: "10 min", label: "Avg delivery" },
                        { num: "5,000+", label: "Products" },
                        { num: "2M+", label: "Happy users" },
                    ].map((s) => (
                        <div key={s.label} className={styles.stat}>
                            <span className={styles.statNum}>{s.num}</span>
                            <span className={styles.statLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right: Visual ── */}
            <div className={styles.right} aria-hidden="true">
                {/* Delivery card */}
                <div className={`${styles.deliveryCard} animate-float`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}>🛵</div>
                        <div>
                            <p className={styles.cardTitle}>Order on the way!</p>
                            <p className={styles.cardSub}>Arrives in ~8 minutes</p>
                        </div>
                    </div>

                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} />
                    </div>

                    <ul className={styles.itemList}>
                        {DELIVERY_ITEMS.map((item) => (
                            <li key={item.name} className={styles.item}>
                                <span className={styles.itemEmoji}>{item.emoji}</span>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemPrice}>{item.price}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Floating badges */}
                <div className={`${styles.floatBadge} ${styles.badgeTop} animate-float-slow`}>
                    <span className={styles.floatDot} />
                    {LIVE_ACTIVITY[activityIndex]}
                </div>

                <div className={`${styles.floatBadge} ${styles.badgeBottom} animate-float-delay`}>
                    <span className={`${styles.floatDot} ${styles.floatDotOrange}`} />
                    97% on-time delivery
                </div>
            </div>
        </section>
    );
};

export default Hero;