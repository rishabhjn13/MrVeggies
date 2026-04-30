'use client';

import React, { useState } from 'react';
import styles from './TrackOrders.module.css';
import Navbar from '@/app/components/Navbar';

/* ─── Types ──────────────────────────────────────────────── */
type OrderStatus = 'delivered' | 'shipped' | 'processing' | 'cancelled' | 'returning';

interface OrderItem {
    name: string;
    qty: number;
    price: number;
    image: string;
}

interface TrackingStep {
    label: string;
    time: string;
    done: boolean;
    active: boolean;
}

interface Order {
    id: string;
    date: string;
    status: OrderStatus;
    total: number;
    items: OrderItem[];
    tracking: TrackingStep[];
    carrier: string;
    trackingNumber: string;
    eta: string;
}

/* ─── Static Data ────────────────────────────────────────── */
const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-29481',
        date: '28 Apr 2025',
        status: 'shipped',
        total: 4799,
        carrier: 'Blue Dart',
        trackingNumber: 'BD2948103721',
        eta: '30 Apr 2025',
        items: [
            { name: 'Mechanical Keyboard TKL', qty: 1, price: 3299, image: '⌨️' },
            { name: 'USB-C Hub 7-in-1', qty: 1, price: 1500, image: '🔌' },
        ],
        tracking: [
            { label: 'Order Placed', time: '28 Apr, 10:12 AM', done: true, active: false },
            { label: 'Payment Confirmed', time: '28 Apr, 10:14 AM', done: true, active: false },
            { label: 'Packed & Dispatched', time: '28 Apr, 3:45 PM', done: true, active: false },
            { label: 'In Transit', time: '29 Apr, 8:20 AM', done: true, active: true },
            { label: 'Out for Delivery', time: 'Expected 30 Apr', done: false, active: false },
            { label: 'Delivered', time: 'Expected 30 Apr', done: false, active: false },
        ],
    },
    {
        id: 'ORD-28774',
        date: '21 Apr 2025',
        status: 'delivered',
        total: 12499,
        carrier: 'Delhivery',
        trackingNumber: 'DL8277491023',
        eta: 'Delivered 24 Apr',
        items: [
            { name: 'Noise-Cancelling Headphones', qty: 1, price: 12499, image: '🎧' },
        ],
        tracking: [
            { label: 'Order Placed', time: '21 Apr, 2:00 PM', done: true, active: false },
            { label: 'Payment Confirmed', time: '21 Apr, 2:02 PM', done: true, active: false },
            { label: 'Packed & Dispatched', time: '22 Apr, 11:30 AM', done: true, active: false },
            { label: 'In Transit', time: '23 Apr, 9:00 AM', done: true, active: false },
            { label: 'Out for Delivery', time: '24 Apr, 7:45 AM', done: true, active: false },
            { label: 'Delivered', time: '24 Apr, 1:22 PM', done: true, active: true },
        ],
    },
    {
        id: 'ORD-27301',
        date: '14 Apr 2025',
        status: 'cancelled',
        total: 2299,
        carrier: '—',
        trackingNumber: '—',
        eta: 'Cancelled',
        items: [
            { name: 'Laptop Stand Aluminium', qty: 1, price: 2299, image: '💻' },
        ],
        tracking: [
            { label: 'Order Placed', time: '14 Apr, 9:00 AM', done: true, active: false },
            { label: 'Cancellation Requested', time: '14 Apr, 9:45 AM', done: true, active: false },
            { label: 'Order Cancelled', time: '14 Apr, 10:12 AM', done: true, active: true },
        ],
    },
    {
        id: 'ORD-26950',
        date: '10 Apr 2025',
        status: 'returning',
        total: 5999,
        carrier: 'Ekart',
        trackingNumber: 'EK6950301177',
        eta: 'Return by 2 May',
        items: [
            { name: 'Wireless Mouse Pro', qty: 1, price: 2799, image: '🖱️' },
            { name: 'Mousepad XL', qty: 1, price: 3200, image: '🟦' },
        ],
        tracking: [
            { label: 'Return Initiated', time: '27 Apr, 11:00 AM', done: true, active: false },
            { label: 'Pickup Scheduled', time: '29 Apr, 2:00 PM', done: true, active: false },
            { label: 'Item Picked Up', time: '30 Apr, 10:30 AM', done: true, active: true },
            { label: 'Return In Transit', time: 'Expected 1 May', done: false, active: false },
            { label: 'Refund Initiated', time: 'Expected 2 May', done: false, active: false },
        ],
    },
];

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
    delivered: { label: 'Delivered', color: 'green' },
    shipped: { label: 'In Transit', color: 'blue' },
    processing: { label: 'Processing', color: 'amber' },
    cancelled: { label: 'Cancelled', color: 'red' },
    returning: { label: 'Return In Progress', color: 'orange' },
};

const FILTER_OPTIONS: { id: OrderStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'shipped', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'returning', label: 'Returns' },
    { id: 'cancelled', label: 'Cancelled' },
];

/* ─── Main Page ──────────────────────────────────────────── */
const TrackOrders = () => {
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    const [expandedId, setExpandedId] = useState<string | null>('ORD-29481');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = MOCK_ORDERS.filter(o => {
        const matchStatus = filter === 'all' || o.status === filter;
        const q = searchQuery.toLowerCase();
        const matchSearch =
            !q ||
            o.id.toLowerCase().includes(q) ||
            o.items.some(i => i.name.toLowerCase().includes(q));
        return matchStatus && matchSearch;
    });

    const toggleExpand = (id: string) =>
        setExpandedId(prev => (prev === id ? null : id));

    return (
        <>
            <Navbar />
            <div className={styles.page}>
                <div className={styles.blob1} />
                <div className={styles.blob2} />

                <div className={styles.container}>

                    {/* ── Page Header ── */}
                    <div className={styles.pageHeader}>
                        <div>
                            <p className={styles.eyebrow}>Account</p>
                            <h1 className={styles.pageTitle}>Track Orders</h1>
                            <p className={styles.pageSubtitle}>
                                View status, tracking info, and history for all your orders.
                            </p>
                        </div>
                        <div className={styles.statsRow}>
                            <div className={styles.statPill}>
                                <span className={styles.statNum}>{MOCK_ORDERS.length}</span>
                                <span className={styles.statLabel}>Total</span>
                            </div>
                            <div className={styles.statPill}>
                                <span className={styles.statNum} data-color="blue">
                                    {MOCK_ORDERS.filter(o => o.status === 'shipped').length}
                                </span>
                                <span className={styles.statLabel}>In Transit</span>
                            </div>
                            <div className={styles.statPill}>
                                <span className={styles.statNum} data-color="green">
                                    {MOCK_ORDERS.filter(o => o.status === 'delivered').length}
                                </span>
                                <span className={styles.statLabel}>Delivered</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Filters + Search ── */}
                    <div className={styles.toolbar}>
                        <div className={styles.filterTabs}>
                            {FILTER_OPTIONS.map(f => (
                                <button
                                    key={f.id}
                                    className={`${styles.filterTab} ${filter === f.id ? styles.filterTabActive : ''}`}
                                    onClick={() => setFilter(f.id)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className={styles.searchWrap}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search by order ID or product…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ── Order List ── */}
                    <div className={styles.orderList}>
                        {filtered.length === 0 && (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📦</span>
                                <p>No orders match your filter.</p>
                            </div>
                        )}

                        {filtered.map((order, i) => {
                            const meta = STATUS_META[order.status];
                            const isOpen = expandedId === order.id;

                            return (
                                <div
                                    key={order.id}
                                    className={`${styles.orderCard} ${isOpen ? styles.orderCardOpen : ''}`}
                                    style={{ animationDelay: `${i * 0.07}s` }}
                                >
                                    {/* ─ Card Header ─ */}
                                    <button
                                        className={styles.orderHeader}
                                        onClick={() => toggleExpand(order.id)}
                                        aria-expanded={isOpen}
                                    >
                                        <div className={styles.orderHeaderLeft}>
                                            <div className={styles.orderMeta}>
                                                <span className={styles.orderId}>{order.id}</span>
                                                <span className={styles.orderDate}>{order.date}</span>
                                            </div>
                                            <div className={styles.orderItems}>
                                                {order.items.map(item => (
                                                    <span key={item.name} className={styles.itemPreview}>
                                                        {item.image} {item.name}
                                                        {item.qty > 1 && ` ×${item.qty}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles.orderHeaderRight}>
                                            <span className={`${styles.statusBadge} ${styles[`status_${meta.color}`]}`}>
                                                {meta.label}
                                            </span>
                                            <span className={styles.orderTotal}>
                                                ₹{order.total.toLocaleString('en-IN')}
                                            </span>
                                            <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                                                ›
                                            </span>
                                        </div>
                                    </button>

                                    {/* ─ Expanded Detail ─ */}
                                    {isOpen && (
                                        <div className={styles.orderDetail}>
                                            <div className={styles.detailGrid}>

                                                {/* Tracking timeline */}
                                                <div className={styles.trackingPanel}>
                                                    <p className={styles.panelLabel}>Shipment Tracking</p>
                                                    <div className={styles.carrierRow}>
                                                        <span className={styles.carrierName}>{order.carrier}</span>
                                                        <span className={styles.trackingNum}>{order.trackingNumber}</span>
                                                    </div>
                                                    <div className={styles.etaRow}>
                                                        <span className={styles.etaLabel}>ETA</span>
                                                        <span className={styles.etaValue}>{order.eta}</span>
                                                    </div>

                                                    <div className={styles.timeline}>
                                                        {order.tracking.map((step, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`${styles.timelineStep} ${step.done ? styles.stepDone : ''} ${step.active ? styles.stepActive : ''}`}
                                                            >
                                                                <div className={styles.stepIndicator}>
                                                                    <div className={styles.stepDot} />
                                                                    {idx < order.tracking.length - 1 && (
                                                                        <div className={styles.stepLine} />
                                                                    )}
                                                                </div>
                                                                <div className={styles.stepContent}>
                                                                    <span className={styles.stepLabel}>{step.label}</span>
                                                                    <span className={styles.stepTime}>{step.time}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Order items */}
                                                <div className={styles.itemsPanel}>
                                                    <p className={styles.panelLabel}>Items in this Order</p>
                                                    <div className={styles.itemsList}>
                                                        {order.items.map(item => (
                                                            <div key={item.name} className={styles.itemRow}>
                                                                <span className={styles.itemEmoji}>{item.image}</span>
                                                                <div className={styles.itemInfo}>
                                                                    <span className={styles.itemName}>{item.name}</span>
                                                                    <span className={styles.itemQty}>Qty: {item.qty}</span>
                                                                </div>
                                                                <span className={styles.itemPrice}>
                                                                    ₹{item.price.toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        <div className={styles.itemsTotal}>
                                                            <span>Order Total</span>
                                                            <span>₹{order.total.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className={styles.actionBtns}>
                                                        {order.status === 'delivered' && (
                                                            <button className={styles.actionBtn}>↩ Return / Exchange</button>
                                                        )}
                                                        {order.status === 'shipped' && (
                                                            <button className={styles.actionBtn}>📍 Live Track</button>
                                                        )}
                                                        <button className={`${styles.actionBtn} ${styles.actionBtnGhost}`}>
                                                            🧾 Download Invoice
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </>
    );
};

export default TrackOrders;