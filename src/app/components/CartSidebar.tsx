'use client';

import React from 'react';
import styles from './CartSidebar.module.css';
import Link from 'next/link';
import { CartSidebarProps } from '@/types/database';

const CartSidebar: React.FC<CartSidebarProps> = ({
    isOpen,
    onClose,
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
}) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 29; // Example
    const total = subtotal + deliveryFee;

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
                        <span className={styles.itemCount}>({cartItems.length} items)</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Cart Items */}
                <div className={styles.itemsContainer}>
                    {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    {item.image || '🥬'}
                                </div>
                                <div className={styles.itemDetails}>
                                    <h4>{item.name}</h4>
                                    <p className={styles.itemPrice}>₹{item.price}</p>

                                    <div className={styles.quantityControl}>
                                        <button
                                            onClick={() => onUpdateQuantity?.(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => onRemoveItem?.(item.id)}
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
                {cartItems.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Delivery Fee</span>
                                <span>₹{deliveryFee}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <button className={styles.checkoutBtn}>
                            Proceed to Checkout
                        </button>

                        <p className={styles.deliveryNote}>
                            Delivery in ~10-15 minutes • Free delivery above ₹499
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;