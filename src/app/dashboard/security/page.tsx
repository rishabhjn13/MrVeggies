'use client';

import React, { useState } from 'react';
import styles from './SecurityPage.module.css';
import Navbar from '@/app/components/Navbar';

/* =========================================================
   Types
   ========================================================= */
type TwoFAMethod = 'authenticator' | 'sms' | 'email';

interface Session {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
    icon: string;
}

/* =========================================================
   Mock data
   ========================================================= */
const SESSIONS: Session[] = [
    { id: '1', device: 'Chrome on macOS', location: 'New Delhi, IN', lastActive: 'Active now', current: true, icon: '💻' },
    { id: '2', device: 'Safari on iPhone', location: 'Mumbai, IN', lastActive: '2h ago', current: false, icon: '📱' },
    { id: '3', device: 'Firefox on Windows', location: 'Bengaluru, IN', lastActive: '3d ago', current: false, icon: '🖥️' },
];

const OTP_PLACEHOLDER = ['', '', '', '', '', ''];

/* =========================================================
   Sub-components
   ========================================================= */

/** Animated shield icon */
const ShieldIcon = ({ active }: { active: boolean }) => (
    <svg className={`${styles.shieldSvg} ${active ? styles.shieldActive : ''}`} viewBox="0 0 48 56" fill="none">
        <path
            d="M24 2L4 10v16c0 12.7 8.6 24.6 20 28 11.4-3.4 20-15.3 20-28V10L24 2z"
            fill={active ? 'var(--c-brand)' : 'none'}
            fillOpacity={active ? 0.15 : 0}
            stroke="var(--c-brand)"
            strokeWidth="2.5"
            strokeLinejoin="round"
        />
        {active && (
            <path
                d="M16 27l6 6 10-10"
                stroke="var(--c-brand)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.checkPath}
            />
        )}
    </svg>
);

/* =========================================================
   Main Page
   ========================================================= */
const SecurityPage = () => {
    /* --- Password section --- */
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false });
    const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);

    /* --- 2FA section --- */
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [selected2FA, setSelected2FA] = useState<TwoFAMethod>('authenticator');
    const [setupStep, setSetupStep] = useState<'idle' | 'verify' | 'done'>('idle');
    const [otp, setOtp] = useState<string[]>([...OTP_PLACEHOLDER]);
    const [otpError, setOtpError] = useState('');
    const [verifying, setVerifying] = useState(false);

    /* --- Sessions --- */
    const [sessions, setSessions] = useState<Session[]>(SESSIONS);
    const [revoking, setRevoking] = useState<string | null>(null);

    /* =====================================================
       Password handlers
       ===================================================== */
    const togglePw = (field: keyof typeof pwVisible) =>
        setPwVisible(p => ({ ...p, [field]: !p[field] }));

    const strength = (() => {
        const p = pwForm.next;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthClass = ['', styles.weak, styles.fair, styles.good, styles.strong][strength];

    const handlePwSave = async () => {
        const errs: Record<string, string> = {};
        if (!pwForm.current) errs.current = 'Current password is required';
        if (pwForm.next.length < 8) errs.next = 'Must be at least 8 characters';
        if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match';
        setPwErrors(errs);
        if (Object.keys(errs).length) return;

        setPwSaving(true);
        await new Promise(r => setTimeout(r, 900));
        setPwSaving(false);
        setPwSuccess(true);
        setPwForm({ current: '', next: '', confirm: '' });
        setTimeout(() => setPwSuccess(false), 3000);
    };

    /* =====================================================
       2FA handlers
       ===================================================== */
    const handleEnable2FA = () => {
        setSetupStep('verify');
        setOtp([...OTP_PLACEHOLDER]);
        setOtpError('');
    };

    const handleOtpChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        setOtpError('');
        if (val && i < 5) {
            const nextInput = document.getElementById(`otp-${i + 1}`);
            (nextInput as HTMLInputElement)?.focus();
        }
    };

    const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            const prev = document.getElementById(`otp-${i - 1}`);
            (prev as HTMLInputElement)?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) { setOtpError('Enter all 6 digits'); return; }
        setVerifying(true);
        await new Promise(r => setTimeout(r, 800));
        setVerifying(false);
        // mock: any 6-digit code works
        setSetupStep('done');
        setTwoFAEnabled(true);
    };

    const handleDisable2FA = () => {
        setTwoFAEnabled(false);
        setSetupStep('idle');
    };

    /* =====================================================
       Session handlers
       ===================================================== */
    const handleRevoke = async (id: string) => {
        setRevoking(id);
        await new Promise(r => setTimeout(r, 700));
        setSessions(s => s.filter(x => x.id !== id));
        setRevoking(null);
    };

    /* =====================================================
       Render
       ===================================================== */
    return (
        <>
            <Navbar />
            <div className={styles.page}>
                <div className={styles.container}>

                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Security</h1>
                            <p className={styles.subtitle}>Manage your password, two-factor authentication, and active sessions.</p>
                        </div>
                        <div className={styles.securityScore}>
                            <ShieldIcon active={twoFAEnabled} />
                            <div>
                                <span className={styles.scoreLabel}>Security level</span>
                                <span className={`${styles.scoreValue} ${twoFAEnabled ? styles.scoreHigh : styles.scoreLow}`}>
                                    {twoFAEnabled ? 'High' : 'Medium'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        SECTION: Change Password
                        ===================================================== */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>🔑</div>
                            <div>
                                <h2 className={styles.cardTitle}>Change Password</h2>
                                <p className={styles.cardSub}>Use a strong, unique password you don't use elsewhere.</p>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            {/* Current */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Current Password</label>
                                <div className={styles.inputWrap}>
                                    <input
                                        className={`${styles.input} ${pwErrors.current ? styles.inputError : ''}`}
                                        type={pwVisible.current ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        value={pwForm.current}
                                        onChange={e => { setPwForm(p => ({ ...p, current: e.target.value })); setPwErrors(p => ({ ...p, current: '' })); }}
                                    />
                                    <button className={styles.eyeBtn} onClick={() => togglePw('current')} type="button">
                                        {pwVisible.current ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {pwErrors.current && <span className={styles.errorMsg}>{pwErrors.current}</span>}
                            </div>

                            {/* New */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>New Password</label>
                                <div className={styles.inputWrap}>
                                    <input
                                        className={`${styles.input} ${pwErrors.next ? styles.inputError : ''}`}
                                        type={pwVisible.next ? 'text' : 'password'}
                                        placeholder="Min. 8 characters"
                                        value={pwForm.next}
                                        onChange={e => { setPwForm(p => ({ ...p, next: e.target.value })); setPwErrors(p => ({ ...p, next: '' })); }}
                                    />
                                    <button className={styles.eyeBtn} onClick={() => togglePw('next')} type="button">
                                        {pwVisible.next ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {pwErrors.next && <span className={styles.errorMsg}>{pwErrors.next}</span>}

                                {/* Strength bar */}
                                {pwForm.next && (
                                    <div className={styles.strengthWrap}>
                                        <div className={styles.strengthBar}>
                                            {[1, 2, 3, 4].map(n => (
                                                <div key={n} className={`${styles.strengthSegment} ${n <= strength ? strengthClass : ''}`} />
                                            ))}
                                        </div>
                                        <span className={`${styles.strengthLabel} ${strengthClass}`}>{strengthLabel}</span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Confirm New Password</label>
                                <div className={styles.inputWrap}>
                                    <input
                                        className={`${styles.input} ${pwErrors.confirm ? styles.inputError : ''}`}
                                        type={pwVisible.confirm ? 'text' : 'password'}
                                        placeholder="Repeat new password"
                                        value={pwForm.confirm}
                                        onChange={e => { setPwForm(p => ({ ...p, confirm: e.target.value })); setPwErrors(p => ({ ...p, confirm: '' })); }}
                                    />
                                    <button className={styles.eyeBtn} onClick={() => togglePw('confirm')} type="button">
                                        {pwVisible.confirm ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {pwErrors.confirm && <span className={styles.errorMsg}>{pwErrors.confirm}</span>}
                            </div>

                            <div className={styles.cardFooterRow}>
                                {pwSuccess && <span className={styles.successMsg}>✓ Password updated successfully</span>}
                                <button
                                    className={`${styles.primaryBtn} ${pwSaving ? styles.btnLoading : ''}`}
                                    onClick={handlePwSave}
                                    disabled={pwSaving}
                                >
                                    {pwSaving ? <span className={styles.spinner} /> : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* =====================================================
                        SECTION: Two-Factor Authentication
                        ===================================================== */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>🛡️</div>
                            <div className={styles.cardHeaderText}>
                                <h2 className={styles.cardTitle}>Two-Factor Authentication</h2>
                                <p className={styles.cardSub}>Add a second layer of protection to your account.</p>
                            </div>
                            {twoFAEnabled && (
                                <span className={styles.enabledBadge}>Enabled</span>
                            )}
                        </div>

                        <div className={styles.cardBody}>
                            {/* Status banner */}
                            <div className={`${styles.statusBanner} ${twoFAEnabled ? styles.statusOn : styles.statusOff}`}>
                                <span className={styles.statusDot} />
                                {twoFAEnabled
                                    ? '2FA is active — your account has enhanced protection.'
                                    : 'Your account is not protected by two-factor authentication yet.'}
                            </div>

                            {/* Method selector — shown when not yet enabled */}
                            {!twoFAEnabled && setupStep === 'idle' && (
                                <>
                                    <div className={styles.sectionLabel}>Choose a method</div>
                                    <div className={styles.methodGrid}>
                                        {([
                                            { key: 'authenticator', icon: '📲', title: 'Authenticator App', sub: 'Google Authenticator, Authy, etc.' },
                                            { key: 'sms', icon: '💬', title: 'SMS / Text Message', sub: 'Code sent to your phone number' },
                                            { key: 'email', icon: '📧', title: 'Email OTP', sub: 'Code sent to your email address' },
                                        ] as { key: TwoFAMethod; icon: string; title: string; sub: string }[]).map(m => (
                                            <button
                                                key={m.key}
                                                className={`${styles.methodCard} ${selected2FA === m.key ? styles.methodActive : ''}`}
                                                onClick={() => setSelected2FA(m.key)}
                                                type="button"
                                            >
                                                <span className={styles.methodIcon}>{m.icon}</span>
                                                <span className={styles.methodTitle}>{m.title}</span>
                                                <span className={styles.methodSub}>{m.sub}</span>
                                                <span className={styles.methodCheck}>{selected2FA === m.key ? '✓' : ''}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <button className={styles.primaryBtn} onClick={handleEnable2FA}>
                                        Set Up {selected2FA === 'authenticator' ? 'Authenticator' : selected2FA === 'sms' ? 'SMS' : 'Email'} 2FA
                                    </button>
                                </>
                            )}

                            {/* OTP Verification step */}
                            {setupStep === 'verify' && (
                                <div className={styles.otpSection}>
                                    <p className={styles.otpInstruction}>
                                        {selected2FA === 'authenticator'
                                            ? 'Open your authenticator app and enter the 6-digit code shown.'
                                            : selected2FA === 'sms'
                                                ? 'We\'ve sent a 6-digit code to your registered phone number.'
                                                : 'We\'ve sent a 6-digit code to your registered email address.'}
                                    </p>
                                    <div className={styles.otpRow}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                id={`otp-${i}`}
                                                className={`${styles.otpInput} ${otpError ? styles.inputError : ''}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                            />
                                        ))}
                                    </div>
                                    {otpError && <span className={styles.errorMsg}>{otpError}</span>}
                                    <div className={styles.otpActions}>
                                        <button className={styles.ghostBtn} onClick={() => setSetupStep('idle')}>Cancel</button>
                                        <button
                                            className={`${styles.primaryBtn} ${verifying ? styles.btnLoading : ''}`}
                                            onClick={handleVerify}
                                            disabled={verifying}
                                        >
                                            {verifying ? <span className={styles.spinner} /> : 'Verify & Activate'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Enabled state — manage */}
                            {setupStep === 'done' && twoFAEnabled && (
                                <div className={styles.manageTwoFA}>
                                    <div className={styles.activeMethod}>
                                        <span>{selected2FA === 'authenticator' ? '📲' : selected2FA === 'sms' ? '💬' : '📧'}</span>
                                        <div>
                                            <span className={styles.activeMethodTitle}>
                                                {selected2FA === 'authenticator' ? 'Authenticator App' : selected2FA === 'sms' ? 'SMS' : 'Email OTP'}
                                            </span>
                                            <span className={styles.activeMethodSub}>Currently active method</span>
                                        </div>
                                    </div>
                                    <button className={styles.dangerBtn} onClick={handleDisable2FA}>Disable 2FA</button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* =====================================================
                        SECTION: Active Sessions
                        ===================================================== */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>🔍</div>
                            <div>
                                <h2 className={styles.cardTitle}>Active Sessions</h2>
                                <p className={styles.cardSub}>These devices are currently signed in to your account.</p>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            {sessions.length === 0 ? (
                                <p className={styles.emptyText}>No other active sessions.</p>
                            ) : (
                                <div className={styles.sessionList}>
                                    {sessions.map((s, i) => (
                                        <div
                                            key={s.id}
                                            className={styles.sessionRow}
                                            style={{ animationDelay: `${i * 0.07}s` }}
                                        >
                                            <span className={styles.sessionDeviceIcon}>{s.icon}</span>
                                            <div className={styles.sessionInfo}>
                                                <span className={styles.sessionDevice}>
                                                    {s.device}
                                                    {s.current && <span className={styles.currentBadge}>This device</span>}
                                                </span>
                                                <span className={styles.sessionMeta}>{s.location} &middot; {s.lastActive}</span>
                                            </div>
                                            {!s.current && (
                                                <button
                                                    className={`${styles.revokeBtn} ${revoking === s.id ? styles.btnLoading : ''}`}
                                                    onClick={() => handleRevoke(s.id)}
                                                    disabled={revoking === s.id}
                                                >
                                                    {revoking === s.id ? <span className={styles.spinnerSm} /> : 'Revoke'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {sessions.filter(s => !s.current).length > 0 && (
                                <button
                                    className={styles.dangerBtnOutline}
                                    onClick={async () => {
                                        for (const s of sessions.filter(x => !x.current)) {
                                            await handleRevoke(s.id);
                                        }
                                    }}
                                >
                                    Revoke all other sessions
                                </button>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
};

export default SecurityPage;