'use client';

import React, { useState } from 'react';
import styles from './ProductCard.module.css';
import { ProductSchema } from '../../types/database';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
    product: ProductSchema;
    onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [added, setAdded] = useState(false);
    const { items, addItem } = useCartStore();
    const discountPercentage = Math.round(
        ((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100
    );

    const hasDiscount = Number(product.price) < Number(product.mrp);

    const handleAddToCart = () => {

        addItem(product);
        setAdded(true)
        setTimeout(() => setAdded(false), 1800);
        console.log(items);
    };

    return (
        <div className={styles.card}>

            {/* Shimmer top bar */}
            <div className={styles.topBar} />

            {/* Discount Badge */}
            {hasDiscount && (
                <div className={styles.discountBadge}>
                    <span className={styles.discountArrow}>▼</span>
                    {Math.floor(discountPercentage)}% off
                </div>
            )}

            {/* Category chip */}
            <div className={styles.categoryChip}>
                {product.category}
            </div>

            {/* Product Name */}
            <h3 className={styles.name}>{product.product_name}</h3>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Pricing Block */}
            <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                    <span className={styles.discountedPrice}>₹{product.price}</span>
                    {hasDiscount && (
                        <span className={styles.actualPrice}>₹{product.mrp}</span>
                    )}
                </div>
                {hasDiscount && (
                    <p className={styles.savingsTag}>
                        You save ₹{(Number(product.mrp) - Number(product.price)).toFixed(0)}
                    </p>
                )}
            </div>

            {/* Add to Cart Button */}
            <button
                className={`${styles.addBtn} ${added ? styles.addedState : ''}`}
                onClick={handleAddToCart}
            >
                <span className={styles.btnIcon}>{added ? '✓' : '+'}</span>
                <span>{added ? 'Added!' : 'Add to Cart'}</span>
            </button>
        </div>
    );
};

export default ProductCard;