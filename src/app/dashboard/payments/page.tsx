'use client';

import React, { useState } from 'react';
import styles from './PyamentConfig.module.css';
import Navbar from '@/app/components/Navbar';

/* ─── Types ──────────────────────────────────────────────── */
type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay';
type UPIApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim';

interface SavedCard {
    id: string;
    network: CardNetwork;
    last4: string;
    holder: string;
    expiry: string;
    isDefault: boolean;
}

interface UPIHandle {
    id: string;
    handle: string;
    app: UPIApp;
    isDefault: boolean;
}

interface PaymentPrefs {
    saveCards: boolean;
    autoPay: boolean;
    sendReceipts: boolean;
    internationalCards: boolean;
    emiEnabled: boolean;
    defaultMethod: 'card' | 'upi' | 'netbanking' | 'cod';
}

/* ─── Static Data ────────────────────────────────────────── */
const MOCK_CARDS: SavedCard[] = [
    { id: 'c1', network: 'visa', last4: '4242', holder: 'Rishabh Jain', expiry: '08/27', isDefault: true },
    { id: 'c2', network: 'mastercard', last4: '8731', holder: 'Rishabh Jain', expiry: '03/26', isDefault: false },
    { id: 'c3', network: 'rupay', last4: '1194', holder: 'R Jain', expiry: '11/25', isDefault: false },
];

const MOCK_UPI: UPIHandle[] = [
    { id: 'u1', handle: 'rishabh@okaxis', app: 'gpay', isDefault: true },
    { id: 'u2', handle: 'rishabh@ybl', app: 'phonepe', isDefault: false },
];

const NETWORK_COLORS: Record<CardNetwork, string> = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#007BC1',
    rupay: '#006f3c',
};

const NETWORK_LABEL: Record<CardNetwork, string> = {
    visa: 'VISA', mastercard: 'Mastercard', amex: 'Amex', rupay: 'RuPay',
};

const UPI_LABELS: Record<UPIApp, string> = {
    gpay: 'Google Pay', phonepe: 'PhonePe', paytm: 'Paytm', bhim: 'BHIM',
};

const UPI_EMOJI: Record<UPIApp, string> = {
    gpay: '🅖', phonepe: '💜', paytm: '🔵', bhim: '🇮🇳',
};

const METHOD_OPTIONS = [
    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
    { id: 'upi', label: 'UPI', icon: '⚡' },
    { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
] as const;

/* ─── Sub-components ─────────────────────────────────────── */

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
        <button
            role="switch"
            aria-checked={on}
            className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
            onClick={onChange}
        >
            <span className={styles.toggleThumb} />
        </button>
    );
}

function CardChip({ network }: { network: CardNetwork }) {
    const color = NETWORK_COLORS[network];
    const label = NETWORK_LABEL[network];
    return (
        <span className={styles.networkBadge} style={{ '--net-color': color } as React.CSSProperties}>
            {label}
        </span>
    );
}

function CardVisual({ card }: { card: SavedCard }) {
    return (
        <div className={styles.cardVisual} data-network={card.network}>
            <div className={styles.cardChip} />
            <div className={styles.cardNumber}>•••• •••• •••• {card.last4}</div>
            <div className={styles.cardMeta}>
                <span className={styles.cardHolder}>{card.holder}</span>
                <span className={styles.cardExpiry}>EXP {card.expiry}</span>
            </div>
            <span className={styles.cardNetworkLabel}>{NETWORK_LABEL[card.network]}</span>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
const PaymentConfig = () => {
    const [cards, setCards] = useState<SavedCard[]>(MOCK_CARDS);
    const [upis, setUpis] = useState<UPIHandle[]>(MOCK_UPI);
    const [activeTab, setActiveTab] = useState<'cards' | 'upi' | 'preferences'>('cards');
    const [saved, setSaved] = useState(false);

    const [prefs, setPrefs] = useState<PaymentPrefs>({
        saveCards: true,
        autoPay: false,
        sendReceipts: true,
        internationalCards: false,
        emiEnabled: true,
        defaultMethod: 'upi',
    });

    const [newUPI, setNewUPI] = useState('');
    const [upiError, setUpiError] = useState('');
    const [addingCard, setAddingCard] = useState(false);

    /* helpers */
    const togglePref = (key: keyof PaymentPrefs) =>
        setPrefs(p => ({ ...p, [key]: !p[key] }));

    const setDefaultCard = (id: string) =>
        setCards(cs => cs.map(c => ({ ...c, isDefault: c.id === id })));

    const removeCard = (id: string) =>
        setCards(cs => cs.filter(c => c.id !== id));

    const setDefaultUPI = (id: string) =>
        setUpis(us => us.map(u => ({ ...u, isDefault: u.id === id })));

    const removeUPI = (id: string) =>
        setUpis(us => us.filter(u => u.id !== id));

    const addUPI = () => {
        if (!newUPI.trim()) { setUpiError('Enter a UPI handle'); return; }
        if (!/@/.test(newUPI)) { setUpiError('Must contain @'); return; }
        setUpis(us => [...us, {
            id: Date.now().toString(),
            handle: newUPI.trim(),
            app: 'bhim',
            isDefault: us.length === 0,
        }]);
        setNewUPI('');
        setUpiError('');
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const TABS = [
        { id: 'cards', label: 'Saved Cards', count: cards.length },
        { id: 'upi', label: 'UPI', count: upis.length },
        { id: 'preferences', label: 'Preferences', count: null },
    ] as const;

    return (
        <>
            <Navbar />
            <div className={styles.page}>
                {/* bg blobs */}
                <div className={styles.blob1} />
                <div className={styles.blob2} />

                <div className={styles.container}>

                    {/* ── Page Header ── */}
                    <div className={styles.pageHeader}>
                        <div>
                            <p className={styles.eyebrow}>Account Settings</p>
                            <h1 className={styles.pageTitle}>Payment Configuration</h1>
                            <p className={styles.pageSubtitle}>
                                Manage your cards, UPI handles, and payment preferences securely.
                            </p>
                        </div>
                        <div className={styles.securityBadge}>
                            <span className={styles.securityIcon}>🔒</span>
                            <div>
                                <span className={styles.securityTitle}>256-bit SSL</span>
                                <span className={styles.securitySub}>PCI-DSS Compliant</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Two-column layout ── */}
                    <div className={styles.layout}>

                        {/* LEFT — Sidebar nav + info */}
                        <aside className={styles.sidebar}>
                            <nav className={styles.sideNav}>
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`${styles.sideNavItem} ${activeTab === tab.id ? styles.sideNavActive : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <span className={styles.sideNavLabel}>{tab.label}</span>
                                        {tab.count !== null && (
                                            <span className={styles.sideNavCount}>{tab.count}</span>
                                        )}
                                    </button>
                                ))}
                            </nav>

                            {/* Info card */}
                            <div className={styles.infoCard}>
                                <span className={styles.infoIcon}>🛡️</span>
                                <p className={styles.infoTitle}>Your data is safe</p>
                                <p className={styles.infoText}>
                                    We never store your full card number. All payment data is encrypted
                                    and tokenised via our banking partners.
                                </p>
                            </div>

                            {/* Default method pill */}
                            <div className={styles.defaultMethodCard}>
                                <span className={styles.dmLabel}>Default payment</span>
                                <span className={styles.dmValue}>
                                    {METHOD_OPTIONS.find(m => m.id === prefs.defaultMethod)?.icon}{' '}
                                    {METHOD_OPTIONS.find(m => m.id === prefs.defaultMethod)?.label}
                                </span>
                            </div>
                        </aside>

                        {/* RIGHT — Main panel */}
                        <main className={styles.main}>

                            {/* ══ CARDS TAB ══ */}
                            {activeTab === 'cards' && (
                                <section className={styles.section} key="cards">
                                    <div className={styles.sectionHeader}>
                                        <div>
                                            <h2 className={styles.sectionTitle}>Saved Cards</h2>
                                            <p className={styles.sectionSub}>Tap a card to set it as default.</p>
                                        </div>
                                        <button
                                            className={styles.addBtn}
                                            onClick={() => setAddingCard(v => !v)}
                                        >
                                            {addingCard ? '✕ Cancel' : '+ Add Card'}
                                        </button>
                                    </div>

                                    {/* Add card stub */}
                                    {addingCard && (
                                        <div className={styles.addCardBanner}>
                                            <span className={styles.addCardIcon}>💳</span>
                                            <div>
                                                <p className={styles.addCardTitle}>Redirect to secure card vault</p>
                                                <p className={styles.addCardSub}>
                                                    You&apos;ll be taken to our PCI-DSS certified partner to enter your card details. We never see your raw card number.
                                                </p>
                                            </div>
                                            <button className={styles.proceedBtn}>
                                                Proceed →
                                            </button>
                                        </div>
                                    )}

                                    <div className={styles.cardGrid}>
                                        {cards.map((card, i) => (
                                            <div
                                                key={card.id}
                                                className={`${styles.cardRow} ${card.isDefault ? styles.cardRowDefault : ''}`}
                                                style={{ animationDelay: `${i * 0.07}s` }}
                                            >
                                                {/* mini visual */}
                                                <CardVisual card={card} />

                                                {/* info */}
                                                <div className={styles.cardInfo}>
                                                    <div className={styles.cardInfoTop}>
                                                        <CardChip network={card.network} />
                                                        {card.isDefault && (
                                                            <span className={styles.defaultBadge}>✓ Default</span>
                                                        )}
                                                    </div>
                                                    <p className={styles.cardMasked}>•••• •••• •••• {card.last4}</p>
                                                    <p className={styles.cardSubInfo}>{card.holder} · Expires {card.expiry}</p>
                                                </div>

                                                {/* actions */}
                                                <div className={styles.cardActions}>
                                                    {!card.isDefault && (
                                                        <button
                                                            className={styles.setDefaultBtn}
                                                            onClick={() => setDefaultCard(card.id)}
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button
                                                        className={styles.removeBtn}
                                                        onClick={() => removeCard(card.id)}
                                                        aria-label="Remove card"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {cards.length === 0 && (
                                            <div className={styles.emptyState}>
                                                <span className={styles.emptyIcon}>💳</span>
                                                <p>No saved cards yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* ══ UPI TAB ══ */}
                            {activeTab === 'upi' && (
                                <section className={styles.section} key="upi">
                                    <div className={styles.sectionHeader}>
                                        <div>
                                            <h2 className={styles.sectionTitle}>UPI Handles</h2>
                                            <p className={styles.sectionSub}>Instant payments directly from your bank.</p>
                                        </div>
                                    </div>

                                    {/* Add UPI */}
                                    <div className={styles.addUpiRow}>
                                        <div className={styles.upiInputWrap}>
                                            <span className={styles.upiAt}>⚡</span>
                                            <input
                                                className={`${styles.upiInput} ${upiError ? styles.inputError : ''}`}
                                                type="text"
                                                placeholder="yourname@okaxis"
                                                value={newUPI}
                                                onChange={e => { setNewUPI(e.target.value); setUpiError(''); }}
                                                onKeyDown={e => e.key === 'Enter' && addUPI()}
                                            />
                                        </div>
                                        <button className={styles.addBtn} onClick={addUPI}>Link UPI</button>
                                    </div>
                                    {upiError && <p className={styles.errorMsg}>⚠ {upiError}</p>}

                                    <div className={styles.upiList}>
                                        {upis.map((u, i) => (
                                            <div
                                                key={u.id}
                                                className={`${styles.upiRow} ${u.isDefault ? styles.upiRowDefault : ''}`}
                                                style={{ animationDelay: `${i * 0.07}s` }}
                                            >
                                                <span className={styles.upiAppIcon}>{UPI_EMOJI[u.app]}</span>
                                                <div className={styles.upiInfo}>
                                                    <p className={styles.upiHandle}>{u.handle}</p>
                                                    <p className={styles.upiAppLabel}>{UPI_LABELS[u.app]}</p>
                                                </div>
                                                {u.isDefault && <span className={styles.defaultBadge}>✓ Default</span>}
                                                <div className={styles.cardActions}>
                                                    {!u.isDefault && (
                                                        <button
                                                            className={styles.setDefaultBtn}
                                                            onClick={() => setDefaultUPI(u.id)}
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button
                                                        className={styles.removeBtn}
                                                        onClick={() => removeUPI(u.id)}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {upis.length === 0 && (
                                            <div className={styles.emptyState}>
                                                <span className={styles.emptyIcon}>⚡</span>
                                                <p>No UPI handles linked yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* ══ PREFERENCES TAB ══ */}
                            {activeTab === 'preferences' && (
                                <section className={styles.section} key="prefs">
                                    <div className={styles.sectionHeader}>
                                        <div>
                                            <h2 className={styles.sectionTitle}>Preferences</h2>
                                            <p className={styles.sectionSub}>Control how payments behave across your account.</p>
                                        </div>
                                    </div>

                                    {/* Default payment method */}
                                    <div className={styles.prefGroup}>
                                        <p className={styles.prefGroupLabel}>Default Payment Method</p>
                                        <div className={styles.methodGrid}>
                                            {METHOD_OPTIONS.map(m => (
                                                <button
                                                    key={m.id}
                                                    className={`${styles.methodBtn} ${prefs.defaultMethod === m.id ? styles.methodBtnActive : ''}`}
                                                    onClick={() => setPrefs(p => ({ ...p, defaultMethod: m.id }))}
                                                >
                                                    <span className={styles.methodIcon}>{m.icon}</span>
                                                    <span className={styles.methodLabel}>{m.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Toggle preferences */}
                                    <div className={styles.prefGroup}>
                                        <p className={styles.prefGroupLabel}>Account Settings</p>
                                        <div className={styles.toggleList}>
                                            {([
                                                { key: 'saveCards', label: 'Save cards for faster checkout', sub: 'Securely tokenised by our banking partner' },
                                                { key: 'autoPay', label: 'Enable AutoPay for subscriptions', sub: 'Auto-debit on due date from default method' },
                                                { key: 'sendReceipts', label: 'Email receipts after every payment', sub: 'Sent to your registered email address' },
                                                { key: 'internationalCards', label: 'Allow international cards', sub: 'Cards issued outside India may incur forex fees' },
                                                { key: 'emiEnabled', label: 'Enable EMI on eligible orders', sub: 'Convert large orders to easy monthly instalments' },
                                            ] as { key: keyof PaymentPrefs; label: string; sub: string }[]).map(item => (
                                                <div key={item.key} className={styles.toggleRow}>
                                                    <div className={styles.toggleInfo}>
                                                        <span className={styles.toggleLabel}>{item.label}</span>
                                                        <span className={styles.toggleSub}>{item.sub}</span>
                                                    </div>
                                                    <Toggle
                                                        on={prefs[item.key] as boolean}
                                                        onChange={() => togglePref(item.key)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Danger zone */}
                                    <div className={`${styles.prefGroup} ${styles.dangerGroup}`}>
                                        <p className={`${styles.prefGroupLabel} ${styles.dangerLabel}`}>Danger Zone</p>
                                        <div className={styles.dangerRow}>
                                            <div>
                                                <p className={styles.dangerTitle}>Remove all saved payment methods</p>
                                                <p className={styles.dangerSub}>This will delete all cards and UPI handles. This action cannot be undone.</p>
                                            </div>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => { setCards([]); setUpis([]); }}
                                            >
                                                Remove All
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── Save bar ── */}
                            <div className={styles.saveBar}>
                                <p className={styles.saveNote}>
                                    Changes apply immediately to future transactions.
                                </p>
                                <button
                                    className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`}
                                    onClick={handleSave}
                                >
                                    {saved ? '✓ Saved!' : 'Save Changes'}
                                </button>
                            </div>

                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};
export default PaymentConfig;