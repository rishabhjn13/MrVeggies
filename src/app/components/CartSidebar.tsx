'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import styles from './CartSidebar.module.css';
import Link from 'next/link';
import { parsePrice, useCartStore } from '@/store/useCartStore';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Product image with an emoji fallback when there is no link or it fails to load */
const CartItemImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) return <>🛒</>;

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
        />
    );
};

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const total = useCartStore((state) => state.total);

    /* Render into document.body so Navbar styles (transform, backdrop-filter,
       overflow, z-index) can't clip or mis-position the fixed sidebar */
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    /* Close on Escape and lock page scroll while open */
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen, onClose]);

    const subtotal = total();
    const deliveryFee = subtotal >= 499 ? 0 : 29;
    const grandTotal = subtotal + deliveryFee;

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            {isOpen && <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />}

            {/* Cart Sidebar */}
            <div
                className={`${styles.cartSidebar} ${isOpen ? styles.open : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                aria-hidden={!isOpen}
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2>Your Cart</h2>
                        <span className={styles.itemCount}>({items.length} items)</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
                        ✕
                    </button>
                </div>

                {/* Cart Items */}
                <div className={styles.itemsContainer}>
                    {items.length > 0 ? (
                        items.map((item) => {
                            const unitPrice = parsePrice(item.discounted_price);

                            return (
                                <div key={item.product_id} className={styles.cartItem}>
                                    <div className={styles.itemImage}>
                                        <CartItemImage src={item.img_link} alt={item.product_name} />
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <h4>{item.product_name}</h4>
                                        <p className={styles.itemPrice}>
                                            ₹{unitPrice.toLocaleString('en-IN')}
                                        </p>

                                        <div className={styles.quantityControl}>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeItem(item.product_id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyIcon}>🛒</div>
                            <h3>Your cart is empty</h3>
                            <p>Looks like you haven&apos;t added anything yet.</p>
                            <Link href="/search" onClick={onClose} className={styles.shopNowBtn}>
                                Browse Products
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Delivery Fee</span>
                                <span>
                                    {deliveryFee === 0
                                        ? <span className={styles.freeTag}>FREE</span>
                                        : `₹${deliveryFee}`
                                    }
                                </span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                            {subtotal < 499 && (
                                <p className={styles.freeDeliveryHint}>
                                    Add ₹{(499 - subtotal).toFixed(0)} more for free delivery
                                </p>
                            )}
                        </div>

                        <button className={styles.checkoutBtn} onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>

                        <p className={styles.deliveryNote}>
                            Delivery in ~10–15 minutes • Free delivery above ₹499
                        </p>
                    </div>
                )}
            </div>
        </>,
        document.body,
    );
};

export default CartSidebar;