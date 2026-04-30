'use client';

import React from 'react';
import styles from './CartSidebar.module.css';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const total = useCartStore((state) => state.total);

    const subtotal = total();
    const deliveryFee = subtotal >= 499 ? 0 : 29;
    const grandTotal = subtotal + deliveryFee;

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className={styles.backdrop} onClick={onClose} />}

            {/* Cart Sidebar */}
            <div className={`${styles.cartSidebar} ${isOpen ? styles.open : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2>Your Cart</h2>
                        <span className={styles.itemCount}>({items.length} items)</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Cart Items */}
                <div className={styles.itemsContainer}>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    🥬
                                </div>
                                <div className={styles.itemDetails}>
                                    <h4>{item.name}</h4>
                                    <p className={styles.itemPrice}>₹{item.price}</p>

                                    <div className={styles.quantityControl}>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeItem(item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
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

                        <button className={styles.checkoutBtn}>
                            Proceed to Checkout
                        </button>

                        <p className={styles.deliveryNote}>
                            Delivery in ~10–15 minutes • Free delivery above ₹499
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;