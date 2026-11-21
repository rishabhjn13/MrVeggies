'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './CheckoutPage.module.css';
import Navbar from '@/app/components/Navbar';
import { parsePrice, useCartStore } from '@/store/useCartStore';
import { useAddressStore, selectDefaultAddress } from '@/store/useAddressStore';
import type { Address, AddressType } from '@/types/address';

/* =========================================================
   Types
   ========================================================= */
type CartLine = ReturnType<typeof useCartStore.getState>['items'][number];
type Step = 1 | 2 | 3 | 4;
type DeliveryId = 'instant' | 'scheduled';
type PayMethod = 'upi' | 'card' | 'cod';

interface Order { id: string; eta: string; total: number; itemCount: number; paymentLabel: string; deliveryLabel: string; address: Address }

interface AddressFormState {
    type: AddressType;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
}

/* =========================================================
   Config (mirrors the cart sidebar: free delivery from ₹499, else ₹29)
   Coupons are mock data. Replace with Firestore / server rules.
   ========================================================= */
const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 29;

const DELIVERY: Record<DeliveryId, { label: string; desc: string }> = {
    instant: { label: 'Instant delivery', desc: 'Arrives in about 10 to 15 minutes' },
    scheduled: { label: 'Scheduled delivery', desc: 'Pick a time slot that suits you' },
};

const SLOTS = ['Today, 6 PM to 8 PM', 'Today, 8 PM to 10 PM', 'Tomorrow, 8 AM to 10 AM', 'Tomorrow, 6 PM to 8 PM'];

const COUPONS: Record<string, { kind: 'percent' | 'shipping'; value: number; title: string; desc: string }> = {
    SAVE10: { kind: 'percent', value: 10, title: '10% off', desc: 'On your entire order' },
    WELCOME5: { kind: 'percent', value: 5, title: '5% off', desc: 'For first-time orders' },
    FREEDEL: { kind: 'shipping', value: 0, title: 'Free instant delivery', desc: 'No delivery fee on any order value' },
};

const STEPS = ['Delivery', 'Review', 'Payment', 'Confirmation'];

const STEP_COPY: Record<Step, { title: string; sub: string }> = {
    1: { title: 'Delivery details', sub: 'Choose where to deliver and how fast you want it.' },
    2: { title: 'Offers and order summary', sub: 'Apply a coupon and check your order before paying.' },
    3: { title: 'Payment', sub: 'Choose how you want to pay.' },
    4: { title: 'Order confirmed', sub: 'Thank you. Your order has been placed.' },
};

const ADDRESS_TYPES: AddressType[] = ['Home', 'Work', 'Other'];

const EMPTY_FORM: AddressFormState = {
    type: 'Home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
/** "Flat 4, Lake View" + optional line 2 on one line */
const streetLine = (a: Address) => [a.addressLine1, a.addressLine2].filter(Boolean).join(', ');

/* =========================================================
   Icons
   ========================================================= */
const Svg = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
);
const IconArrowLeft = () => <Svg size={16}><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></Svg>;
const IconCheck = ({ size = 14 }: { size?: number }) => <Svg size={size}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
const IconPlus = () => <Svg size={16}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>;
const IconLock = () => <Svg size={14}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></Svg>;
const IconBag = ({ size = 22 }: { size?: number }) => <Svg size={size}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></Svg>;

/* =========================================================
   Small shared pieces (defined outside so inputs keep focus)
   ========================================================= */
const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
    <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={id}>{label}</label>
        {children}
        {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
);

/** Product thumbnail with an icon fallback when there is no link or it fails to load */
const Thumb = ({ src, alt }: { src?: string; alt: string }) => {
    const [failed, setFailed] = useState(false);
    return (
        <div className={styles.thumb}>
            {!src || failed ? <IconBag /> : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
            )}
        </div>
    );
};

const Stepper = ({ current, onGo }: { current: Step; onGo: (s: Step) => void }) => (
    <ol className={styles.stepper} aria-label="Checkout progress">
        {STEPS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = n < current;
            const active = n === current;
            const cls = `${styles.stepItem} ${done ? styles.stepDone : ''} ${active ? styles.stepCurrent : ''}`;
            const inner = (
                <>
                    <span className={styles.stepDot}>{done ? <IconCheck size={12} /> : n}</span>
                    <span className={styles.stepLabel}>{label}</span>
                </>
            );
            return (
                <li key={label} className={cls} aria-current={active ? 'step' : undefined}>
                    {done && current !== 4
                        ? <button className={styles.stepBtn} onClick={() => onGo(n)} type="button">{inner}</button>
                        : <span className={styles.stepBtn}>{inner}</span>}
                </li>
            );
        })}
    </ol>
);

/* =========================================================
   Main Content
   ========================================================= */
const CheckoutContent = () => {
    /* Cart (same store as the sidebar) */
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const total = useCartStore((s) => s.total);

    /* Saved addresses (Firestore: user_addresses/{uid}, synced by initAddressSync) */
    const addresses = useAddressStore((s) => s.addresses);
    const addressesLoading = useAddressStore((s) => s.loading);
    const addressesError = useAddressStore((s) => s.error);
    const addAddress = useAddressStore((s) => s.addAddress);
    const defaultAddress = useAddressStore(selectDefaultAddress);

    /* Avoid an "empty cart" flash while the persisted store rehydrates */
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [step, setStep] = useState<Step>(1);
    const headingRef = useRef<HTMLHeadingElement>(null);

    /* Step 1 */
    const [addressId, setAddressId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [deliveryId, setDeliveryId] = useState<DeliveryId>('instant');
    const [slot, setSlot] = useState(SLOTS[0]);

    /* Step 2 */
    const [couponInput, setCouponInput] = useState('');
    const [coupon, setCoupon] = useState<string | null>(null);
    const [couponError, setCouponError] = useState('');

    /* Step 3 */
    const [method, setMethod] = useState<PayMethod>('upi');
    const [upiId, setUpiId] = useState('');
    const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [payErrors, setPayErrors] = useState<Record<string, string>>({});
    const [placing, setPlacing] = useState(false);

    /* Step 4 */
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        window.scrollTo({ top: 0 });
        headingRef.current?.focus();
    }, [step]);

    /* Selected address: the user's pick, else the default, else the first saved one */
    const address = addresses.find(a => a.id === addressId) ?? defaultAddress;

    /* Open the form automatically when the user has no saved addresses */
    const formOpen = showForm || (!addressesLoading && addresses.length === 0);

    /* --- Totals --- */
    const totals = useMemo(() => {
        const subtotal = total();
        const mrpSavings = items.reduce(
            (s, i) => s + Math.max(0, parsePrice(i.actual_price) - parsePrice(i.discounted_price)) * i.quantity, 0);
        const c = coupon ? COUPONS[coupon] : null;
        const discount = c?.kind === 'percent' ? Math.round((subtotal * c.value) / 100) : 0;
        const afterDiscount = subtotal - discount;
        const instantFee = c?.kind === 'shipping' || afterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
        const delivery = deliveryId === 'instant' ? instantFee : 0; // scheduled delivery is free
        return { subtotal, mrpSavings, discount, instantFee, delivery, total: afterDiscount + delivery };
    }, [items, total, coupon, deliveryId]);

    /* =====================================================
       Step 1 handlers
       ===================================================== */
    const setField = <K extends keyof AddressFormState>(key: K, value: AddressFormState[K]) => {
        setForm(f => ({ ...f, [key]: value }));
        setFormErrors(e => ({ ...e, [key]: '' }));
    };

    const closeForm = () => {
        setShowForm(false);
        setForm(EMPTY_FORM);
        setFormErrors({});
    };

    const saveAddress = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Enter the recipient name';
        if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a 10-digit mobile number';
        if (!form.addressLine1.trim()) e.addressLine1 = 'Enter the address';
        if (!form.city.trim()) e.city = 'Enter the city';
        if (!form.state.trim()) e.state = 'Enter the state';
        if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a 6-digit pincode';
        setFormErrors(e);
        if (Object.keys(e).length) return;

        try {
            // Writes to Firestore (optimistic) and returns the new id so we can select it.
            // The store makes the first address the default automatically.
            const id = addAddress({
                type: form.type,
                name: form.name.trim(),
                phone: form.phone,
                addressLine1: form.addressLine1.trim(),
                addressLine2: form.addressLine2.trim() || undefined,
                landmark: form.landmark.trim() || undefined,
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode,
                isDefault: false,
            });
            setAddressId(id);
            closeForm();
        } catch (err) {
            setFormErrors({ form: err instanceof Error ? err.message : 'Could not save the address' });
        }
    };

    /* =====================================================
       Step 2 handlers
       ===================================================== */
    const applyCoupon = (raw: string) => {
        const code = raw.trim().toUpperCase();
        if (!code) { setCouponError('Enter a coupon code'); return; }
        if (!COUPONS[code]) { setCouponError('This code is not valid'); return; }
        setCoupon(code);
        setCouponError('');
        setCouponInput('');
    };

    /* =====================================================
       Step 3 handlers
       ===================================================== */
    const validatePayment = () => {
        const e: Record<string, string> = {};
        if (method === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
            e.upi = 'Enter a valid UPI ID, for example name@bank';
        }
        if (method === 'card') {
            if (card.number.replace(/\s/g, '').length !== 16) e.number = 'Enter the 16-digit card number';
            if (!card.name.trim()) e.name = 'Enter the name on the card';
            const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(card.expiry);
            if (!m) e.expiry = 'Use MM/YY';
            else if (new Date(2000 + Number(m[2]), Number(m[1]), 0, 23, 59, 59) < new Date()) e.expiry = 'This card has expired';
            if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = 'Enter the CVV';
        }
        return e;
    };

    const placeOrder = async () => {
        const e = validatePayment();
        setPayErrors(e);
        if (Object.keys(e).length || !address) return;

        setPlacing(true);
        // TODO: create the order on the server, recompute prices and stock there,
        // charge through your payment gateway, and confirm via webhook.
        await new Promise(r => setTimeout(r, 1200));

        const paymentLabel =
            method === 'upi' ? `UPI (${upiId.trim()})`
                : method === 'card' ? `Card ending ${card.number.replace(/\s/g, '').slice(-4)}`
                    : 'Cash on delivery';

        setOrder({
            id: `ORD-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eta: deliveryId === 'instant' ? 'Arriving in about 10 to 15 minutes.' : `Scheduled for ${slot}.`,
            total: totals.total,
            itemCount: items.reduce((n, i) => n + i.quantity, 0),
            paymentLabel,
            deliveryLabel: deliveryId === 'instant' ? DELIVERY.instant.label : `${DELIVERY.scheduled.label}, ${slot}`,
            address, // snapshot, so later edits to the address book don't change this order
        });
        setPlacing(false);
        setStep(4);

        // Clear the cart only after the order is placed
        items.forEach(i => removeItem(i.product_id));
    };

    /* =====================================================
       Shared footer (total + primary action)
       ===================================================== */
    const footer = (label: string, onClick: () => void, disabled = false, loading = false) => (
        <div className={styles.footerRow}>
            <div className={styles.footerTotal}>
                <span className={styles.footerLabel}>Total</span>
                <span className={styles.footerValue}>{inr(totals.total)}</span>
            </div>
            <button className={styles.primaryBtn} onClick={onClick} disabled={disabled || loading} type="button">
                {loading ? <span className={styles.spinner} aria-label="Processing" /> : label}
            </button>
        </div>
    );

    const copy = STEP_COPY[step];

    /* =====================================================
       Render
       ===================================================== */
    if (!mounted) {
        return (<><Navbar /><div className={styles.page} /></>);
    }

    if (items.length === 0 && step !== 4) {
        return (
            <>
                <Navbar />
                <div className={styles.page}>
                    <div className={styles.container}>
                        <section className={styles.card}>
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}><IconBag size={30} /></div>
                                <h1 className={styles.emptyTitle}>Your cart is empty</h1>
                                <p className={styles.emptyText}>Add a few items to your cart to check out.</p>
                                <Link href="/search" className={styles.primaryBtn}>Browse Products</Link>
                            </div>
                        </section>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.page}>
                <div className={styles.container}>

                    {/* Back */}
                    {step === 1 && (
                        <Link href="/search" className={styles.backLink}><IconArrowLeft /><span>Back to shopping</span></Link>
                    )}
                    {(step === 2 || step === 3) && (
                        <button className={styles.backLink} onClick={() => setStep((step - 1) as Step)} type="button">
                            <IconArrowLeft /><span>{step === 2 ? 'Back to delivery' : 'Back to review'}</span>
                        </button>
                    )}

                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title} ref={headingRef} tabIndex={-1}>{copy.title}</h1>
                        <p className={styles.subtitle}>{copy.sub}</p>
                    </div>

                    <Stepper current={step} onGo={s => setStep(s)} />

                    {/* =====================================================
                        STEP 1: Address + delivery
                        ===================================================== */}
                    {step === 1 && (
                        <>
                            <section className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.cardTitle}>Delivery address</h2>
                                    {!formOpen && !addressesLoading && (
                                        <button className={styles.ghostBtn} onClick={() => setShowForm(true)} type="button">
                                            <IconPlus /> Add new address
                                        </button>
                                    )}
                                </div>
                                <div className={styles.cardBody}>
                                    {addressesLoading && (
                                        <p className={styles.optionSub} role="status">Loading your saved addresses...</p>
                                    )}

                                    {addressesError && !addressesLoading && (
                                        <span className={styles.errorMsg} role="alert">{addressesError}</span>
                                    )}

                                    {!addressesLoading && addresses.length > 0 && (
                                        <div className={styles.optionList} role="radiogroup" aria-label="Delivery address">
                                            {addresses.map(a => (
                                                <label key={a.id} className={`${styles.option} ${a.id === address?.id ? styles.optionActive : ''}`}>
                                                    <input type="radio" name="address" className={styles.srOnly}
                                                        checked={a.id === address?.id} onChange={() => setAddressId(a.id)} />
                                                    <span className={styles.radioMark} aria-hidden="true" />
                                                    <span className={styles.optionMain}>
                                                        <span className={styles.optionTitle}>
                                                            {a.name} <span className={styles.tag}>{a.type}</span>
                                                            {a.isDefault && <> <span className={styles.tag}>Default</span></>}
                                                        </span>
                                                        <span className={styles.optionSub}>{streetLine(a)}</span>
                                                        {a.landmark && <span className={styles.optionSub}>Landmark: {a.landmark}</span>}
                                                        <span className={styles.optionSub}>{a.city}, {a.state} {a.pincode}</span>
                                                        <span className={styles.optionSub}>Mobile: {a.phone}</span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {!addressesLoading && addresses.length === 0 && (
                                        <p className={styles.optionSub}>You have no saved addresses yet. Add one to continue.</p>
                                    )}

                                    {formOpen && (
                                        <div className={styles.formBox}>
                                            <h3 className={styles.formTitle}>New address</h3>
                                            <div className={styles.fieldGrid}>
                                                <Field id="a-name" label="Full name" error={formErrors.name}>
                                                    <input id="a-name" className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
                                                        value={form.name} onChange={e => setField('name', e.target.value)} />
                                                </Field>
                                                <Field id="a-phone" label="Mobile number" error={formErrors.phone}>
                                                    <input id="a-phone" className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                                                        inputMode="numeric" maxLength={10} value={form.phone}
                                                        onChange={e => setField('phone', e.target.value.replace(/\D/g, ''))} />
                                                </Field>
                                                <div className={styles.fullRow}>
                                                    <Field id="a-line1" label="Address line 1" error={formErrors.addressLine1}>
                                                        <input id="a-line1" className={`${styles.input} ${formErrors.addressLine1 ? styles.inputError : ''}`}
                                                            placeholder="House no., building, street" value={form.addressLine1}
                                                            onChange={e => setField('addressLine1', e.target.value)} />
                                                    </Field>
                                                </div>
                                                <div className={styles.fullRow}>
                                                    <Field id="a-line2" label="Address line 2 (optional)">
                                                        <input id="a-line2" className={styles.input}
                                                            placeholder="Area, locality" value={form.addressLine2}
                                                            onChange={e => setField('addressLine2', e.target.value)} />
                                                    </Field>
                                                </div>
                                                <div className={styles.fullRow}>
                                                    <Field id="a-landmark" label="Landmark (optional)">
                                                        <input id="a-landmark" className={styles.input}
                                                            placeholder="Near metro station, temple, etc." value={form.landmark}
                                                            onChange={e => setField('landmark', e.target.value)} />
                                                    </Field>
                                                </div>
                                                <Field id="a-city" label="City" error={formErrors.city}>
                                                    <input id="a-city" className={`${styles.input} ${formErrors.city ? styles.inputError : ''}`}
                                                        value={form.city} onChange={e => setField('city', e.target.value)} />
                                                </Field>
                                                <Field id="a-state" label="State" error={formErrors.state}>
                                                    <input id="a-state" className={`${styles.input} ${formErrors.state ? styles.inputError : ''}`}
                                                        value={form.state} onChange={e => setField('state', e.target.value)} />
                                                </Field>
                                                <Field id="a-pin" label="Pincode" error={formErrors.pincode}>
                                                    <input id="a-pin" className={`${styles.input} ${formErrors.pincode ? styles.inputError : ''}`}
                                                        inputMode="numeric" maxLength={6} value={form.pincode}
                                                        onChange={e => setField('pincode', e.target.value.replace(/\D/g, ''))} />
                                                </Field>
                                                <Field id="a-type" label="Save as">
                                                    <select id="a-type" className={styles.input} value={form.type}
                                                        onChange={e => setField('type', e.target.value as AddressType)}>
                                                        {ADDRESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </Field>
                                            </div>
                                            {formErrors.form && <span className={styles.errorMsg} role="alert">{formErrors.form}</span>}
                                            <div className={styles.formActions}>
                                                {addresses.length > 0 && (
                                                    <button className={styles.ghostBtn} onClick={closeForm} type="button">Cancel</button>
                                                )}
                                                <button className={styles.primaryBtn} onClick={saveAddress} type="button">Save address</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className={styles.card}>
                                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Delivery options</h2></div>
                                <div className={styles.cardBody}>
                                    <div className={styles.optionList} role="radiogroup" aria-label="Delivery option">
                                        {(Object.keys(DELIVERY) as DeliveryId[]).map(id => {
                                            const price = id === 'instant' ? totals.instantFee : 0;
                                            return (
                                                <label key={id} className={`${styles.option} ${deliveryId === id ? styles.optionActive : ''}`}>
                                                    <input type="radio" name="delivery" className={styles.srOnly}
                                                        checked={deliveryId === id} onChange={() => setDeliveryId(id)} />
                                                    <span className={styles.radioMark} aria-hidden="true" />
                                                    <span className={styles.optionMain}>
                                                        <span className={styles.optionTitle}>{DELIVERY[id].label}</span>
                                                        <span className={styles.optionSub}>{DELIVERY[id].desc}</span>
                                                    </span>
                                                    <span className={styles.optionPrice}>{price === 0 ? 'Free' : inr(price)}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {deliveryId === 'scheduled' && (
                                        <Field id="slot" label="Delivery slot">
                                            <select id="slot" className={styles.input} value={slot} onChange={e => setSlot(e.target.value)}>
                                                {SLOTS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </Field>
                                    )}

                                    {footer('Continue to review', () => setStep(2), !address || addressesLoading)}
                                </div>
                            </section>
                        </>
                    )}

                    {/* =====================================================
                        STEP 2: Offers + order summary
                        ===================================================== */}
                    {step === 2 && (
                        <>
                            <section className={styles.card}>
                                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Coupons and offers</h2></div>
                                <div className={styles.cardBody}>
                                    {coupon ? (
                                        <div className={styles.couponApplied}>
                                            <span className={styles.couponText}><IconCheck /> {coupon} applied ({COUPONS[coupon].title})</span>
                                            <button className={styles.linkBtn} onClick={() => setCoupon(null)} type="button">Remove</button>
                                        </div>
                                    ) : (
                                        <Field id="coupon" label="Have a code?" error={couponError}>
                                            <div className={styles.couponRow}>
                                                <input id="coupon" className={`${styles.input} ${styles.upper} ${couponError ? styles.inputError : ''}`}
                                                    placeholder="Enter code" value={couponInput}
                                                    onChange={e => { setCouponInput(e.target.value); setCouponError(''); }}
                                                    onKeyDown={e => { if (e.key === 'Enter') applyCoupon(couponInput); }} />
                                                <button className={styles.ghostBtn} onClick={() => applyCoupon(couponInput)} type="button">Apply</button>
                                            </div>
                                        </Field>
                                    )}

                                    <ul className={styles.offerList}>
                                        {Object.entries(COUPONS).map(([code, c]) => (
                                            <li key={code} className={styles.offerRow}>
                                                <div className={styles.offerText}>
                                                    <span className={styles.offerCode}>{code}</span>
                                                    <span className={styles.offerTitle}>{c.title}</span>
                                                    <span className={styles.optionSub}>{c.desc}</span>
                                                </div>
                                                <button className={styles.ghostBtn} disabled={coupon === code}
                                                    onClick={() => applyCoupon(code)} type="button">
                                                    {coupon === code ? 'Applied' : 'Apply'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.cardTitle}>Order summary</h2>
                                    <span className={styles.cardMeta}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ul className={styles.summaryItems}>
                                        {items.map(i => (
                                            <li key={i.product_id} className={styles.summaryItem}>
                                                <Thumb src={i.img_link} alt={i.product_name} />
                                                <span className={styles.summaryName}>
                                                    {i.product_name}
                                                    <span className={styles.optionSub}>
                                                        {inr(parsePrice(i.discounted_price))} each &middot; Qty {i.quantity}
                                                    </span>
                                                </span>
                                                <span className={styles.num}>{inr(parsePrice(i.discounted_price) * i.quantity)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {address && (
                                        <div className={styles.recap}>
                                            <div>
                                                <span className={styles.recapLabel}>Delivering to</span>
                                                <span className={styles.recapValue}>{address.name}, {streetLine(address)}, {address.city} {address.pincode}</span>
                                                <span className={styles.recapValue}>
                                                    {deliveryId === 'instant' ? DELIVERY.instant.desc : `${DELIVERY.scheduled.label}, ${slot}`}
                                                </span>
                                            </div>
                                            <button className={styles.linkBtn} onClick={() => setStep(1)} type="button">Change</button>
                                        </div>
                                    )}

                                    <dl className={styles.totals}>
                                        <div className={styles.totalRow}><dt>Subtotal</dt><dd>{inr(totals.subtotal)}</dd></div>
                                        {totals.discount > 0 && (
                                            <div className={`${styles.totalRow} ${styles.discountRow}`}><dt>Coupon discount</dt><dd>&minus;{inr(totals.discount)}</dd></div>
                                        )}
                                        <div className={styles.totalRow}><dt>Delivery fee</dt><dd>{totals.delivery === 0 ? <span className={styles.freeTag}>FREE</span> : inr(totals.delivery)}</dd></div>
                                        <div className={`${styles.totalRow} ${styles.grandRow}`}><dt>Total</dt><dd>{inr(totals.total)}</dd></div>
                                    </dl>

                                    {totals.mrpSavings > 0 && (
                                        <p className={styles.savings}>You are saving {inr(totals.mrpSavings)} on MRP with this order.</p>
                                    )}

                                    {footer('Continue to payment', () => setStep(3))}
                                </div>
                            </section>
                        </>
                    )}

                    {/* =====================================================
                        STEP 3: Payment
                        ===================================================== */}
                    {step === 3 && (
                        <section className={styles.card}>
                            <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Payment method</h2></div>
                            <div className={styles.cardBody}>
                                <div className={styles.optionList} role="radiogroup" aria-label="Payment method">
                                    {([
                                        { id: 'upi', title: 'UPI', sub: 'Pay with any UPI app' },
                                        { id: 'card', title: 'Credit or debit card', sub: 'Visa, Mastercard, RuPay' },
                                        { id: 'cod', title: 'Cash on delivery', sub: 'Pay when your order arrives' },
                                    ] as { id: PayMethod; title: string; sub: string }[]).map(m => (
                                        <label key={m.id} className={`${styles.option} ${method === m.id ? styles.optionActive : ''}`}>
                                            <input type="radio" name="pay" className={styles.srOnly}
                                                checked={method === m.id} onChange={() => { setMethod(m.id); setPayErrors({}); }} />
                                            <span className={styles.radioMark} aria-hidden="true" />
                                            <span className={styles.optionMain}>
                                                <span className={styles.optionTitle}>{m.title}</span>
                                                <span className={styles.optionSub}>{m.sub}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {method === 'upi' && (
                                    <Field id="upi" label="UPI ID" error={payErrors.upi}>
                                        <input id="upi" className={`${styles.input} ${payErrors.upi ? styles.inputError : ''}`}
                                            placeholder="name@bank" value={upiId}
                                            onChange={e => { setUpiId(e.target.value); setPayErrors({}); }} />
                                    </Field>
                                )}

                                {method === 'card' && (
                                    <div className={styles.fieldGrid}>
                                        <div className={styles.fullRow}>
                                            <Field id="c-num" label="Card number" error={payErrors.number}>
                                                <input id="c-num" className={`${styles.input} ${payErrors.number ? styles.inputError : ''}`}
                                                    inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000"
                                                    value={card.number} onChange={e => setCard(c => ({ ...c, number: fmtCard(e.target.value) }))} />
                                            </Field>
                                        </div>
                                        <div className={styles.fullRow}>
                                            <Field id="c-name" label="Name on card" error={payErrors.name}>
                                                <input id="c-name" className={`${styles.input} ${payErrors.name ? styles.inputError : ''}`}
                                                    autoComplete="cc-name" value={card.name}
                                                    onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
                                            </Field>
                                        </div>
                                        <Field id="c-exp" label="Expiry" error={payErrors.expiry}>
                                            <input id="c-exp" className={`${styles.input} ${payErrors.expiry ? styles.inputError : ''}`}
                                                inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry}
                                                onChange={e => setCard(c => ({ ...c, expiry: fmtExpiry(e.target.value) }))} />
                                        </Field>
                                        <Field id="c-cvv" label="CVV" error={payErrors.cvv}>
                                            <input id="c-cvv" className={`${styles.input} ${payErrors.cvv ? styles.inputError : ''}`}
                                                inputMode="numeric" autoComplete="cc-csc" maxLength={4} type="password" value={card.cvv}
                                                onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '') }))} />
                                        </Field>
                                    </div>
                                )}

                                <p className={styles.secureNote}><IconLock /> Payments are processed securely.</p>

                                {footer(method === 'cod' ? 'Place order' : `Pay ${inr(totals.total)}`, placeOrder, false, placing)}
                            </div>
                        </section>
                    )}

                    {/* =====================================================
                        STEP 4: Confirmation
                        ===================================================== */}
                    {step === 4 && order && (
                        <section className={styles.card}>
                            <div className={styles.confirmTop}>
                                <div className={styles.confirmIcon}><IconCheck size={28} /></div>
                                <h2 className={styles.confirmTitle}>Order {order.id}</h2>
                                <p className={styles.confirmSub}>{order.eta} We&apos;ll keep you updated as your order is on its way.</p>
                            </div>

                            <div className={styles.cardBody}>
                                <dl className={styles.detailGrid}>
                                    <div>
                                        <dt>Delivering to</dt>
                                        <dd>
                                            {order.address.name}<br />
                                            {streetLine(order.address)}<br />
                                            {order.address.landmark && <>Landmark: {order.address.landmark}<br /></>}
                                            {order.address.city}, {order.address.state} {order.address.pincode}
                                        </dd>
                                    </div>
                                    <div><dt>Delivery</dt><dd>{order.deliveryLabel}</dd></div>
                                    <div><dt>Payment</dt><dd>{order.paymentLabel}</dd></div>
                                    <div><dt>Amount ({order.itemCount} {order.itemCount === 1 ? 'item' : 'items'})</dt><dd>{inr(order.total)}</dd></div>
                                </dl>

                                <div className={styles.confirmActions}>
                                    <Link href="/search" className={styles.ghostBtn}>Continue shopping</Link>
                                    <Link href="/orders" className={styles.primaryBtn}>View my orders</Link>
                                </div>
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </>
    );
};

export default CheckoutContent;