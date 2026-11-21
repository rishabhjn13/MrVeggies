'use client';

import React, { useState } from 'react';
import styles from './ProductCard.module.css';
import { ProductSchema } from '../../types/database';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
    product: ProductSchema;
    onAddToCart?: (productId: string) => void;
    /** Called when the image or title is clicked, e.g. to open the detail modal */
    onOpen?: (product: ProductSchema) => void;
}

const DELIVERY_ETA = '8 mins';

/** "₹1,099", "24,269", "64%" -> 1099, 24269, 64 (NaN if there is no number) */
const parseNumber = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return NaN;
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : NaN;
};

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const formatCount = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(count);

/** "Computers&Accessories|Cables|USBCables" -> "USB Cables" (last segment, spaced out) */
const formatCategory = (category: string) => {
    const last = category?.split('|').pop()?.trim() ?? '';
    return last.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s*&\s*/g, ' & ');
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpen }) => {
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const { addItem } = useCartStore();

    const price = parseNumber(product.discounted_price);
    const mrp = parseNumber(product.actual_price);
    const hasPrice = !Number.isNaN(price);
    const hasDiscount = hasPrice && !Number.isNaN(mrp) && price < mrp;

    // Prefer the stored percentage, fall back to computing it from the prices
    const storedDiscount = parseNumber(product.discount_percentage);
    const discountPercentage = hasDiscount
        ? Number.isNaN(storedDiscount)
            ? Math.floor(((mrp - price) / mrp) * 100)
            : Math.round(storedDiscount)
        : 0;
    const savings = hasDiscount ? mrp - price : 0;

    const rating = parseNumber(product.rating);
    const ratingCount = parseNumber(product.rating_count);
    const hasRating = !Number.isNaN(rating);

    const categoryLabel = formatCategory(product.category);
    const subtitle = product.about_product?.trim();

    const handleAddToCart = (event: React.MouseEvent) => {
        event.stopPropagation(); // ADD must not open the details
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const openDetails = () => onOpen?.(product);

    // Keyboard support for the title (Enter or Space opens the details)
    const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLHeadingElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    };

    return (
        <article className={styles.card} onClick={openDetails}>
            {/* Media frame */}
            <div className={styles.media}>
                {product.img_link && !imageFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        className={styles.image}
                        src={product.img_link}
                        alt={product.product_name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div className={styles.placeholder} aria-hidden="true">🛒</div>
                )}

                {/* Top-left: ETA + discount */}
                <div className={styles.badgeStack}>
                    <span className={styles.etaChip}>
                        <svg className={styles.etaIcon} viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                        </svg>
                        {DELIVERY_ETA}
                    </span>
                    {discountPercentage > 0 && (
                        <span className={styles.discountPill}>{discountPercentage}% OFF</span>
                    )}
                </div>

                {/* Top-right: wishlist (must not open the details) */}
                <button
                    type="button"
                    className={`${styles.wishBtn} ${wishlisted ? styles.wishBtnActive : ''}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        setWishlisted((value) => !value);
                    }}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-pressed={wishlisted}
                >
                    <svg viewBox="0 0 24 24" className={styles.wishIcon} aria-hidden="true">
                        <path
                            d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.6 3 5 6.5 5c2 0 3.4 1.1 4.2 2.4h.6C12.1 6.1 13.5 5 15.5 5 19 5 20.9 8.6 21.5 11.8 19.5 16.4 12 21 12 21z"
                            fill={wishlisted ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Category + rating */}
            {(categoryLabel || hasRating) && (
                <div className={styles.metaRow}>
                    <span className={styles.unit}>{categoryLabel}</span>
                    {hasRating && (
                        <span className={styles.rating}>
                            <svg viewBox="0 0 24 24" className={styles.starIcon} aria-hidden="true">
                                <path
                                    d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
                            {!Number.isNaN(ratingCount) && (
                                <span className={styles.ratingCount}>({formatCount(ratingCount)})</span>
                            )}
                        </span>
                    )}
                </div>
            )}

            {/* Title + subtitle (keyboard users open details with Enter or Space on the title) */}
            <div className={styles.info}>
                <h3
                    className={styles.name}
                    onKeyDown={onOpen ? handleTitleKeyDown : undefined}
                    role={onOpen ? 'button' : undefined}
                    tabIndex={onOpen ? 0 : undefined}
                >
                    {product.product_name}
                </h3>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            {/* Price + CTA */}
            <div className={styles.footer}>
                <div className={styles.priceBlock}>
                    <div className={styles.priceRow}>
                        <span className={styles.price}>
                            {hasPrice ? formatPrice(price) : product.discounted_price}
                        </span>
                        {hasDiscount && <span className={styles.mrp}>{formatPrice(mrp)}</span>}
                    </div>
                    {hasDiscount && <span className={styles.save}>Save {formatPrice(savings)}</span>}
                </div>

                <button
                    type="button"
                    className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`}
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.product_name} to cart`}
                >
                    <span>{added ? 'ADDED' : 'ADD'}</span>
                    <span className={styles.addIcon} aria-hidden="true">{added ? '✓' : '+'}</span>
                </button>
            </div>
        </article>
    );
};

export default ProductCard;