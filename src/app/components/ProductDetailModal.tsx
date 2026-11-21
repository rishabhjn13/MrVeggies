'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './ProductDetailModal.module.css';
import { ProductSchema } from '../../types/database';
import { useCartStore } from '@/store/useCartStore';

interface ProductDetailModalProps {
    /** The product to show. The modal renders nothing when this is null. */
    product: ProductSchema | null;
    onClose: () => void;
    /** Optional "You may also like" products (for example, same category). */
    relatedProducts?: ProductSchema[];
    /** Called when a related product is clicked, so the parent can swap the modal content. */
    onSelectProduct?: (product: ProductSchema) => void;
}

const DELIVERY_ETA = '8 mins';
const MAX_QUANTITY = 10;
const MAX_REVIEWS = 4;

/** "₹1,099", "24,269", "64%" -> 1099, 24269, 64 (NaN if there is no number) */
const parseNumber = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return NaN;
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : NaN;
};

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const formatCount = (count: number) => count.toLocaleString('en-IN');

/** "Computers&Accessories" -> "Computers & Accessories", "USBCables" -> "USB Cables" */
const formatCategory = (category: string) =>
    category.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s*&\s*/g, ' & ');

/** Splits a comma-joined CSV cell into a clean list */
const splitList = (value: string | undefined) =>
    value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];

const getInitials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
};

/** "Fast Charge : It can charge..." -> { label: "Fast Charge", text: "It can charge..." } */
const splitHighlight = (line: string) => {
    const match = line.match(/^([^:]{2,40}?)\s*:\s*([\s\S]+)$/);
    return match ? { label: match[1].trim(), text: match[2].trim() } : { label: '', text: line };
};

type ContentProps = Omit<ProductDetailModalProps, 'product'> & { product: ProductSchema };

const ProductDetailModalContent: React.FC<ContentProps> = ({
    product,
    onClose,
    relatedProducts = [],
    onSelectProduct,
}) => {
    const { addItem } = useCartStore();
    const closeRef = useRef<HTMLButtonElement>(null);

    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [added, setAdded] = useState(false);

    // Escape to close
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    // Lock page scroll while open and focus the close button (runs once per open)
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const view = useMemo(() => {
        if (!product) return null;

        const price = parseNumber(product.discounted_price);
        const mrp = parseNumber(product.actual_price);
        const hasPrice = !Number.isNaN(price);
        const hasDiscount = hasPrice && !Number.isNaN(mrp) && price < mrp;

        const storedDiscount = parseNumber(product.discount_percentage);
        const discountPercentage = hasDiscount
            ? Number.isNaN(storedDiscount)
                ? Math.floor(((mrp - price) / mrp) * 100)
                : Math.round(storedDiscount)
            : 0;

        const rating = parseNumber(product.rating);
        const ratingCount = parseNumber(product.rating_count);

        const categoryPath = (product.category ?? '')
            .split('|')
            .map((part) => part.trim())
            .filter(Boolean)
            .map(formatCategory);

        const highlights = (product.about_product ?? '')
            .split('|')
            .map((line) => line.trim())
            .filter(Boolean)
            .map(splitHighlight);

        // review_* columns are comma-joined lists. Titles/content are only used when they line up with the review ids.
        const ids = splitList(product.review_id);
        const names = splitList(product.user_name);
        const titles = splitList(product.review_title);
        const contents = splitList(product.review_content);
        const reviews = ids
            .slice(0, MAX_REVIEWS)
            .map((id, index) => ({
                id,
                name: names[index] || 'Verified buyer',
                title: titles.length === ids.length ? titles[index] : '',
                content: contents.length === ids.length ? contents[index] : '',
            }))
            .filter((review) => review.title || review.content);

        return {
            price,
            mrp,
            hasPrice,
            hasDiscount,
            savings: hasDiscount ? mrp - price : 0,
            discountPercentage,
            rating,
            hasRating: !Number.isNaN(rating),
            ratingCount,
            hasRatingCount: !Number.isNaN(ratingCount),
            categoryPath,
            highlights,
            reviews,
        };
    }, [product]);

    if (!view) return null;

    const unitPrice = view.hasPrice ? view.price : 0;
    const totalLabel = view.hasPrice ? formatPrice(unitPrice * quantity) : '';

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) addItem(product);
        console.log(`[ProductModal] Added ${quantity} × "${product.product_name}" to cart`);
        toast.success(`${quantity} × added to cart`);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const handleAddRelated = (item: ProductSchema) => {
        addItem(item);
        toast.success('Added to cart');
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: product.product_name, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied');
            }
        } catch (error) {
            // User cancelling the share sheet is not an error
            if ((error as { name?: string })?.name !== 'AbortError') {
                console.error('[ProductModal] Share failed:', error);
                toast.error('Could not share this product');
            }
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <main
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label={product.product_name}
            >
                <div className={styles.closeBar}>
                    <button
                        ref={closeRef}
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* ───────── Top: media + buy box ───────── */}
                <section className={styles.topGrid}>
                    {/* Media */}
                    <div className={styles.mediaCard}>
                        <div className={styles.pills}>
                            <span className={styles.etaChip}>
                                <svg className={styles.etaIcon} viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                                </svg>
                                {DELIVERY_ETA} ETA
                            </span>
                            {view.discountPercentage > 0 && (
                                <span className={styles.discountPill}>{view.discountPercentage}% OFF</span>
                            )}
                        </div>

                        <div className={styles.floatActions}>
                            <button
                                type="button"
                                className={`${styles.iconBtn} ${wishlisted ? styles.iconBtnActive : ''}`}
                                onClick={() => setWishlisted((value) => !value)}
                                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                aria-pressed={wishlisted}
                            >
                                <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
                                    <path
                                        d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.6 3 5 6.5 5c2 0 3.4 1.1 4.2 2.4h.6C12.1 6.1 13.5 5 15.5 5 19 5 20.9 8.6 21.5 11.8 19.5 16.4 12 21 12 21z"
                                        fill={wishlisted ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={handleShare}
                                aria-label="Share product"
                            >
                                <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
                                    <path
                                        d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3m0 0L8 7m4-4 4 4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.heroFrame}>
                            {product.img_link && !imageFailed ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    className={styles.heroImage}
                                    src={product.img_link}
                                    alt={product.product_name}
                                    referrerPolicy="no-referrer"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : (
                                <div className={styles.heroPlaceholder} aria-hidden="true">🛒</div>
                            )}
                        </div>
                    </div>

                    {/* Details + buy box */}
                    <div className={styles.infoCol}>
                        <div className={styles.header}>
                            {view.categoryPath.length > 0 && (
                                <p className={styles.breadcrumb}>{view.categoryPath.join(' › ')}</p>
                            )}
                            <h1 className={styles.title}>{product.product_name}</h1>
                        </div>

                        {(view.hasRating || view.hasRatingCount) && (
                            <div className={styles.metaRow}>
                                {view.hasRating && (
                                    <span className={styles.ratingBadge}>
                                        <svg viewBox="0 0 24 24" className={styles.starIcon} aria-hidden="true">
                                            <path
                                                d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        {view.rating.toFixed(1)}
                                        {view.hasRatingCount && (
                                            <span className={styles.ratingCount}>
                                                | {formatCount(view.ratingCount)} ratings
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className={styles.buyBox}>
                            <div className={styles.priceRow}>
                                <span className={styles.price}>
                                    {view.hasPrice ? formatPrice(view.price) : product.discounted_price}
                                </span>
                                {view.hasDiscount && (
                                    <span className={styles.mrp}>{formatPrice(view.mrp)}</span>
                                )}
                                {view.hasDiscount && (
                                    <span className={styles.savePill}>
                                        Save {formatPrice(view.savings)} ({view.discountPercentage}% OFF)
                                    </span>
                                )}
                            </div>
                            <p className={styles.taxNote}>Inclusive of all taxes.</p>

                            <div className={styles.qtyRow}>
                                <div className={styles.qtyText}>
                                    <span className={styles.qtyLabel}>Quantity</span>
                                    {totalLabel && <span className={styles.qtyTotal}>Total {totalLabel}</span>}
                                </div>
                                <div className={styles.stepper}>
                                    <button
                                        type="button"
                                        className={styles.stepBtn}
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className={styles.stepValue} aria-live="polite">{quantity}</span>
                                    <button
                                        type="button"
                                        className={`${styles.stepBtn} ${styles.stepBtnPrimary}`}
                                        onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                                        disabled={quantity >= MAX_QUANTITY}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`}
                                onClick={handleAddToCart}
                            >
                                {added ? '✓ Added to cart' : `Add to Cart${totalLabel ? ` • ${totalLabel}` : ''}`}
                            </button>

                            <div className={styles.deliveryRow}>
                                <svg className={styles.etaIcon} viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                                </svg>
                                <span>Delivering in <strong>8-12 mins</strong></span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ───────── Highlights ───────── */}
                {view.highlights.length > 0 && (
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>About this item</h2>
                        <ul className={styles.highlightList}>
                            {view.highlights.map((item, index) => (
                                <li key={index} className={styles.highlightItem}>
                                    <span className={styles.highlightDot} aria-hidden="true" />
                                    <p className={styles.highlightText}>
                                        {item.label && <strong>{item.label}: </strong>}
                                        {item.text}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* ───────── Product details ───────── */}
                <section className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>Product details</h2>
                    <dl className={styles.specGrid}>
                        <div className={styles.specItem}>
                            <dt>Product ID</dt>
                            <dd>{product.product_id}</dd>
                        </div>
                        {view.categoryPath.length > 0 && (
                            <div className={styles.specItem}>
                                <dt>Category</dt>
                                <dd>{view.categoryPath[0]}</dd>
                            </div>
                        )}
                        {view.categoryPath.length > 1 && (
                            <div className={styles.specItem}>
                                <dt>Type</dt>
                                <dd>{view.categoryPath[view.categoryPath.length - 1]}</dd>
                            </div>
                        )}
                        {view.hasRating && (
                            <div className={styles.specItem}>
                                <dt>Rating</dt>
                                <dd>
                                    <span className={styles.stars}>{renderStars(view.rating)}</span> {view.rating.toFixed(1)}
                                </dd>
                            </div>
                        )}
                        {view.hasDiscount && (
                            <div className={styles.specItem}>
                                <dt>MRP</dt>
                                <dd>{formatPrice(view.mrp)}</dd>
                            </div>
                        )}
                    </dl>
                </section>

                {/* ───────── Related ───────── */}
                {relatedProducts.length > 0 && (
                    <section className={styles.related}>
                        <h2 className={styles.sectionTitle}>You may also like</h2>
                        <div className={styles.relatedGrid}>
                            {relatedProducts.slice(0, 4).map((item) => {
                                const itemPrice = parseNumber(item.discounted_price);
                                const itemMrp = parseNumber(item.actual_price);
                                const itemDiscount =
                                    !Number.isNaN(itemPrice) && !Number.isNaN(itemMrp) && itemPrice < itemMrp;
                                return (
                                    <div key={item.product_id} className={styles.relCard}>
                                        <button
                                            type="button"
                                            className={styles.relOpen}
                                            onClick={() => onSelectProduct?.(item)}
                                        >
                                            <span className={styles.relMedia}>
                                                {item.img_link ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        className={styles.relImage}
                                                        src={item.img_link}
                                                        alt={item.product_name}
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <span aria-hidden="true">🛒</span>
                                                )}
                                            </span>
                                            <span className={styles.relName}>{item.product_name}</span>
                                        </button>
                                        <div className={styles.relFooter}>
                                            <div>
                                                <p className={styles.relPrice}>
                                                    {Number.isNaN(itemPrice) ? item.discounted_price : formatPrice(itemPrice)}
                                                </p>
                                                {itemDiscount && (
                                                    <p className={styles.relMrp}>{formatPrice(itemMrp)}</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.relAdd}
                                                onClick={() => handleAddRelated(item)}
                                                aria-label={`Add ${item.product_name} to cart`}
                                            >
                                                + ADD
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ───────── Reviews ───────── */}
                {(view.hasRating || view.reviews.length > 0) && (
                    <section className={styles.sectionCard} id="reviews">
                        <h2 className={styles.sectionTitle}>Customer reviews</h2>

                        {view.hasRating && (
                            <div className={styles.ratingSummary}>
                                <span className={styles.ratingBig}>{view.rating.toFixed(1)}</span>
                                <span className={styles.ratingOutOf}>/ 5.0</span>
                                <span className={styles.stars}>{renderStars(view.rating)}</span>
                                {view.hasRatingCount && (
                                    <span className={styles.ratingNote}>
                                        Based on {formatCount(view.ratingCount)} ratings
                                    </span>
                                )}
                            </div>
                        )}

                        {view.reviews.length > 0 && (
                            <div className={styles.reviewGrid}>
                                {view.reviews.map((review) => (
                                    <article key={review.id} className={styles.reviewCard}>
                                        <div className={styles.reviewHead}>
                                            <span className={styles.avatar} aria-hidden="true">
                                                {getInitials(review.name)}
                                            </span>
                                            <div>
                                                <p className={styles.reviewName}>{review.name}</p>
                                                <p className={styles.reviewBadge}>✓ Verified buyer</p>
                                            </div>
                                        </div>
                                        {review.title && <p className={styles.reviewTitle}>{review.title}</p>}
                                        {review.content && <p className={styles.reviewText}>{review.content}</p>}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

/**
 * Wrapper: the key remounts the content whenever a different product is shown,
 * which resets quantity, wishlist and image state without needing an effect.
 */
const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, ...rest }) => {
    if (!product) return null;
    return <ProductDetailModalContent key={product.product_id} product={product} {...rest} />;
};

export default ProductDetailModal;