'use client';

import React from 'react';
import styles from './ProductCard.module.css';
import Image from 'next/image';
import { ProductSchema } from '../../types/database';

interface ProductCardProps {
    product: ProductSchema;
    onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const discountPercentage = Math.round(
        ((product.actual_price - product.discounted_price) / product.actual_price) * 100
    );

    const hasDiscount = product.discounted_price < product.actual_price;

    return (
        <div className={styles.card}>
            {/* Product Image */}
            <div className={styles.imageContainer}>
                {product.img_link ? (
                    <Image
                        src={product.img_link}
                        alt={product.product_name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className={styles.placeholderImage}>
                        🛒
                    </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className={styles.discountBadge}>
                        -{Math.floor(discountPercentage)}%
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className={styles.info}>
                <h3 className={styles.name}>{product.product_name}</h3>

                <p className={styles.category}>{product.category}</p>

                {/* Pricing */}
                <div className={styles.priceContainer}>
                    <span className={styles.discountedPrice}>
                        ₹{product.discounted_price}
                    </span>

                    {hasDiscount && (
                        <span className={styles.actualPrice}>
                            ₹{product.actual_price}
                        </span>
                    )}
                </div>

                {/* Rating */}
                <div className={styles.ratingContainer}>
                    <span className={styles.rating}>⭐ {product.rating}</span>
                    <span className={styles.ratingCount}>
                        ({product.rating_count?.toLocaleString()})
                    </span>
                </div>

                {/* Add to Cart Button */}
                <button
                    className={styles.addBtn}
                    onClick={() => onAddToCart?.(product.product_id)}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;