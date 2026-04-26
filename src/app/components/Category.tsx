import React from "react";
import styles from "./CategoryStrip.module.css";

export interface Category {
    id: string;
    emoji: string;
    name: string;
    count: string;
}

export const CATEGORIES: Category[] = [
    { id: "vegetables", emoji: "🥦", name: "Vegetables", count: "180+" },
    { id: "fruits", emoji: "🍎", name: "Fruits", count: "90+" },
    { id: "dairy", emoji: "🥛", name: "Dairy", count: "60+" },
    { id: "bakery", emoji: "🍞", name: "Bakery", count: "45+" },
    { id: "meat", emoji: "🥩", name: "Meat & Fish", count: "70+" },
    { id: "beverages", emoji: "🧃", name: "Beverages", count: "120+" },
    { id: "snacks", emoji: "🍫", name: "Snacks", count: "200+" },
    { id: "personal", emoji: "🧴", name: "Personal Care", count: "150+" },
    { id: "cooking", emoji: "🍳", name: "Cooking", count: "95+" },
    { id: "cleaning", emoji: "🧹", name: "Cleaning", count: "80+" },
];

interface CategoryStripProps {
    onCategoryClick?: (category: Category) => void;
}

const CategoryStrip: React.FC<CategoryStripProps> = ({ onCategoryClick }) => {
    return (
        <section className={styles.section} id="categories">
            <div className={styles.inner}>
                <div className="section-tag">Browse by category</div>
                <h2 className="section-title">What do you need today?</h2>
                <p className="section-sub">
                    From snacks to staples, everything in one place.
                </p>

                <div className={styles.grid} role="list">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            className={styles.card}
                            role="listitem"
                            onClick={() => onCategoryClick?.(cat)}
                            aria-label={`Browse ${cat.name} — ${cat.count} items`}
                        >
                            <span className={styles.emoji} aria-hidden="true">
                                {cat.emoji}
                            </span>
                            <span className={styles.name}>{cat.name}</span>
                            <span className={styles.count}>{cat.count} items</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryStrip;