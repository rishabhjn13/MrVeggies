'use client';

import React, { useState } from 'react';
import styles from './Support.module.css';
import Navbar from '@/app/components/Navbar';

/* ─── Types ──────────────────────────────────────────────── */
type IssueCategory = 'order' | 'payment' | 'product' | 'account' | 'returns' | 'other';
type Priority = 'low' | 'medium' | 'high';
type SubmitState = 'idle' | 'loading' | 'success';

interface FAQ {
    q: string;
    a: string;
}

/* ─── Static Data ────────────────────────────────────────── */
const CATEGORIES: { id: IssueCategory; label: string; icon: string; desc: string }[] = [
    { id: 'order', label: 'Order Issue', icon: '📦', desc: 'Delays, missing items, wrong order' },
    { id: 'payment', label: 'Payment', icon: '💳', desc: 'Failed payments, refunds, billing' },
    { id: 'product', label: 'Product Quality', icon: '🔍', desc: 'Defective or incorrect products' },
    { id: 'account', label: 'Account', icon: '👤', desc: 'Login, profile, security' },
    { id: 'returns', label: 'Returns & Refunds', icon: '↩️', desc: 'Initiate or track a return' },
    { id: 'other', label: 'Other', icon: '💬', desc: 'General queries and feedback' },
];

const FAQS: FAQ[] = [
    {
        q: 'How long does it take to get a response?',
        a: 'We typically respond within 24 hours on business days. High-priority issues are escalated within 4 hours.',
    },
    {
        q: 'Can I track the status of my support ticket?',
        a: 'Yes — once submitted, you\'ll receive a ticket ID by email. You can use it to track progress in the "My Tickets" section of your account.',
    },
    {
        q: 'What information should I include for order issues?',
        a: 'Please include your Order ID (e.g. ORD-12345), a brief description of the problem, and any relevant photos if the item is damaged.',
    },
    {
        q: 'How do I request a refund?',
        a: 'Refunds can be initiated from the "Track Orders" page or by submitting a support request with the "Returns & Refunds" category.',
    },
];

/* ─── Main Page ──────────────────────────────────────────── */
const WriteToUs = () => {
    const [category, setCategory] = useState<IssueCategory | null>(null);
    const [priority, setPriority] = useState<Priority>('medium');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('rishabh@example.com');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [ticketId, setTicketId] = useState('');

    const charLimit = 1200;
    const charLeft = charLimit - message.length;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const names = Array.from(files).map(f => f.name);
        setAttachments(prev => [...prev, ...names].slice(0, 3));
        e.target.value = '';
    };

    const removeAttachment = (name: string) =>
        setAttachments(prev => prev.filter(a => a !== name));

    const handleSubmit = () => {
        if (!category || !subject.trim() || !message.trim()) return;
        setSubmitState('loading');
        setTimeout(() => {
            setTicketId(`TKT-${Math.floor(10000 + Math.random() * 90000)}`);
            setSubmitState('success');
        }, 1600);
    };

    const handleReset = () => {
        setCategory(null);
        setSubject('');
        setMessage('');
        setOrderId('');
        setAttachments([]);
        setPriority('medium');
        setSubmitState('idle');
        setTicketId('');
    };

    const isValid = !!category && subject.trim().length > 2 && message.trim().length > 10;

    if (submitState === 'success') {
        return (
            <>
                <Navbar />
                <div className={styles.page}>
                    <div className={styles.blob1} />
                    <div className={styles.blob2} />
                    <div className={styles.container}>
                        <div className={styles.successCard}>
                            <div className={styles.successIcon}>✅</div>
                            <h2 className={styles.successTitle}>Message Sent!</h2>
                            <p className={styles.successSub}>
                                Your support ticket has been created. Our team will get back to you within 24 hours.
                            </p>
                            <div className={styles.ticketPill}>
                                <span className={styles.ticketPillLabel}>Ticket ID</span>
                                <span className={styles.ticketPillId}>{ticketId}</span>
                            </div>
                            <p className={styles.successNote}>
                                A confirmation has been sent to <strong>{email}</strong>
                            </p>
                            <div className={styles.successActions}>
                                <button className={styles.newTicketBtn} onClick={handleReset}>
                                    + Submit Another Request
                                </button>
                                <button className={`${styles.newTicketBtn} ${styles.ghostBtn}`}>
                                    🎫 View My Tickets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

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
                            <p className={styles.eyebrow}>Support</p>
                            <h1 className={styles.pageTitle}>Write to Us</h1>
                            <p className={styles.pageSubtitle}>
                                Have a question or issue? We&apos;re here to help — typically within 24 hours.
                            </p>
                        </div>
                        <div className={styles.supportMeta}>
                            <div className={styles.availabilityDot} />
                            <div>
                                <span className={styles.availTitle}>Support Online</span>
                                <span className={styles.availSub}>Mon–Sat, 9 AM – 9 PM IST</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Two-column layout ── */}
                    <div className={styles.layout}>

                        {/* LEFT — Form */}
                        <div className={styles.formCol}>

                            {/* Step 1: Category */}
                            <div className={styles.formSection}>
                                <p className={styles.formSectionLabel}>
                                    <span className={styles.stepNum}>1</span>
                                    What&apos;s your issue about?
                                </p>
                                <div className={styles.categoryGrid}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`${styles.categoryCard} ${category === cat.id ? styles.categoryCardActive : ''}`}
                                            onClick={() => setCategory(cat.id)}
                                        >
                                            <span className={styles.catIcon}>{cat.icon}</span>
                                            <span className={styles.catLabel}>{cat.label}</span>
                                            <span className={styles.catDesc}>{cat.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Details */}
                            <div className={styles.formSection}>
                                <p className={styles.formSectionLabel}>
                                    <span className={styles.stepNum}>2</span>
                                    Tell us more
                                </p>

                                <div className={styles.fieldRow}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Your Email</label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    {(category === 'order' || category === 'payment' || category === 'returns') && (
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Order ID (optional)</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={orderId}
                                                onChange={e => setOrderId(e.target.value)}
                                                placeholder="ORD-12345"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.fieldGroup} style={{ marginBottom: '14px' }}>
                                    <label className={styles.fieldLabel}>Subject</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="Briefly describe your issue…"
                                        maxLength={120}
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <div className={styles.textareaLabelRow}>
                                        <label className={styles.fieldLabel}>Message</label>
                                        <span className={`${styles.charCount} ${charLeft < 100 ? styles.charCountWarn : ''}`}>
                                            {charLeft} left
                                        </span>
                                    </div>
                                    <textarea
                                        className={styles.textarea}
                                        value={message}
                                        onChange={e => setMessage(e.target.value.slice(0, charLimit))}
                                        placeholder="Describe your issue in detail. Include relevant order IDs, dates, or error messages…"
                                        rows={6}
                                    />
                                </div>
                            </div>

                            {/* Step 3: Priority + Attachments */}
                            <div className={styles.formSection}>
                                <p className={styles.formSectionLabel}>
                                    <span className={styles.stepNum}>3</span>
                                    Priority & Attachments
                                </p>

                                <div className={styles.priorityRow}>
                                    <span className={styles.fieldLabel}>Priority</span>
                                    <div className={styles.priorityBtns}>
                                        {(['low', 'medium', 'high'] as Priority[]).map(p => (
                                            <button
                                                key={p}
                                                className={`${styles.priorityBtn} ${styles[`priority_${p}`]} ${priority === p ? styles.priorityBtnActive : ''}`}
                                                onClick={() => setPriority(p)}
                                            >
                                                {p === 'low' ? '🟢' : p === 'medium' ? '🟡' : '🔴'} {p.charAt(0).toUpperCase() + p.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.attachRow}>
                                    <label className={styles.attachLabel}>
                                        <span className={styles.attachIcon}>📎</span>
                                        <span>Attach screenshots or files</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf"
                                            className={styles.fileInput}
                                            onChange={handleFileChange}
                                            disabled={attachments.length >= 3}
                                        />
                                    </label>
                                    <span className={styles.attachHint}>Up to 3 files · Images or PDF</span>
                                </div>

                                {attachments.length > 0 && (
                                    <div className={styles.attachList}>
                                        {attachments.map(name => (
                                            <div key={name} className={styles.attachItem}>
                                                <span className={styles.attachName}>{name}</span>
                                                <button
                                                    className={styles.attachRemove}
                                                    onClick={() => removeAttachment(name)}
                                                    aria-label="Remove"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                className={`${styles.submitBtn} ${!isValid || submitState === 'loading' ? styles.submitBtnDisabled : ''}`}
                                onClick={handleSubmit}
                                disabled={!isValid || submitState === 'loading'}
                            >
                                {submitState === 'loading' ? (
                                    <span className={styles.loadingDots}>
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                ) : (
                                    '✉️ Send Message'
                                )}
                            </button>

                        </div>

                        {/* RIGHT — FAQ + Info */}
                        <aside className={styles.sideCol}>

                            <div className={styles.infoCard}>
                                <span className={styles.infoIcon}>⚡</span>
                                <p className={styles.infoTitle}>Typical Response Time</p>
                                <p className={styles.infoText}>
                                    <strong>High priority:</strong> within 4 hours<br />
                                    <strong>Medium:</strong> within 12 hours<br />
                                    <strong>Low:</strong> within 24 hours
                                </p>
                            </div>

                            <div className={styles.faqSection}>
                                <p className={styles.faqTitle}>Frequently Asked</p>
                                {FAQS.map((faq, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}
                                    >
                                        <button
                                            className={styles.faqQ}
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        >
                                            <span>{faq.q}</span>
                                            <span className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`}>›</span>
                                        </button>
                                        {openFaq === i && (
                                            <div className={styles.faqA}>{faq.a}</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.altContactCard}>
                                <p className={styles.altContactTitle}>Other Ways to Reach Us</p>
                                <div className={styles.altContactItem}>
                                    <span>📧</span>
                                    <div>
                                        <span className={styles.altContactLabel}>Email</span>
                                        <span className={styles.altContactVal}>support@yourstore.in</span>
                                    </div>
                                </div>
                                <div className={styles.altContactItem}>
                                    <span>📞</span>
                                    <div>
                                        <span className={styles.altContactLabel}>Phone</span>
                                        <span className={styles.altContactVal}>1800-123-4567 (Toll Free)</span>
                                    </div>
                                </div>
                                <div className={styles.altContactItem}>
                                    <span>💬</span>
                                    <div>
                                        <span className={styles.altContactLabel}>Live Chat</span>
                                        <span className={styles.altContactVal}>Available on the app</span>
                                    </div>
                                </div>
                            </div>

                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WriteToUs;