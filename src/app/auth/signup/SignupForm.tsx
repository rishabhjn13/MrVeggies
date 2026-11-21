'use client';

import Image from 'next/image';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import heroImage from './speedygrocer-hero.jpg';
import styles from '../login/page.module.css';
import AuthHeader from '@/app/components/AuthHeader';
import { signUpWithEmail } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import type {
    SignupFieldName,
    SignupFormErrors,
    SignupFormTouched,
    SignupFormValues,
    SignupPayload,
} from '@/types/auth';
import {
    ALL_SIGNUP_FIELDS_TOUCHED,
    SIGNUP_FIELD_ORDER,
    validateSignupField,
    validateSignupForm,
} from '@/lib/validation/signup';
import { buildSignupPayload, EMPTY_SIGNUP_VALUES } from '@/lib/auth/signup';
import { getAuthErrorMessage, getErrorCode } from '@/lib/auth/errors';
import { maskEmail } from '@/lib/format';

export default function SignupForm() {
    const router = useRouter();
    const [values, setValues] = useState<SignupFormValues>(EMPTY_SIGNUP_VALUES);
    const [errors, setErrors] = useState<SignupFormErrors>({});
    const [touched, setTouched] = useState<SignupFormTouched>({});
    const [showReferral, setShowReferral] = useState(false);
    const [whatsappConsent, setWhatsappConsent] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as SignupFieldName;
        let value = event.target.value;

        // Keep the mobile field digits-only, max 10
        if (name === 'mobileNumber') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

        setValues((prev) => ({ ...prev, [name]: value }));

        // Once a field has been touched, validate live as the user types
        if (touched[name]) {
            setErrors((prev) => ({ ...prev, [name]: validateSignupField(name, value, showReferral) }));
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const name = event.target.name as SignupFieldName;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const message = validateSignupField(name, values[name], showReferral);
        setErrors((prev) => ({ ...prev, [name]: message }));

        if (message) {
            console.warn(`[Signup] Validation failed on "${name}": ${message}`);
        }
    };

    const toggleReferral = () => {
        setShowReferral((visible) => {
            const next = !visible;
            if (!next) {
                // Clear the code and its error when the field is removed
                setValues((prev) => ({ ...prev, referralCode: '' }));
                setErrors((prev) => ({ ...prev, referralCode: '' }));
                setTouched((prev) => ({ ...prev, referralCode: false }));
            }
            return next;
        });
    };

    const initiateRequest = async (payload: SignupPayload) => {
        console.log('[Signup] Creating Firebase account for', maskEmail(payload.email));
        try {
            const credential = await signUpWithEmail(
                payload.email,
                payload.password,
                payload.fullName,
                {
                    mobileNumber: payload.mobileNumber,
                    referralCode: payload.referralCode,
                    whatsappNotifications: payload.whatsappNotifications,
                }
            );
            console.log('[Signup] Firebase account created, uid:', credential.user.uid);
            // TODO: save mobileNumber, referralCode and whatsappNotifications (e.g. Firestore users/{uid}),
            // Firebase Auth does not store them.
            return credential;
        } catch (error) {
            const code = getErrorCode(error);
            console.error('[Signup] Firebase signup failed:', code, error);
            throw Object.assign(new Error(getAuthErrorMessage(code)), { code });
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) return;

        console.log('[Signup] Form submitted, running validation...');

        // Mark everything as touched so all errors show
        setTouched(ALL_SIGNUP_FIELDS_TOUCHED);

        const validationErrors = validateSignupForm(values, showReferral);
        setErrors(validationErrors);

        const invalidFields = SIGNUP_FIELD_ORDER.filter((field) => validationErrors[field]);
        if (invalidFields.length > 0) {
            const firstInvalid = invalidFields[0];
            console.error('[Signup] Validation failed:', validationErrors);
            toast.error(
                invalidFields.length === 1
                    ? (validationErrors[firstInvalid] as string)
                    : `Please fix ${invalidFields.length} fields to continue.`
            );
            document.getElementById(firstInvalid)?.focus();
            return;
        }

        const payload = buildSignupPayload(values, {
            referralEnabled: showReferral,
            whatsappConsent,
        });

        if (whatsappConsent && !payload.mobileNumber) {
            console.warn('[Signup] WhatsApp consent ticked but no mobile number given; consent ignored.');
        }

        setIsLoading(true);
        const toastId = toast.loading('Creating your account...');

        try {
            await initiateRequest(payload);
            console.log('[Signup] Signup succeeded for', maskEmail(payload.email));
            toast.success(`Account created! Welcome, ${payload.fullName.split(' ')[0]}.`, { id: toastId });
            router.refresh();
            window.location.href = '/';
        } catch (error) {
            console.error('[Signup] Signup request failed:', error);
            if (getErrorCode(error) === 'auth/email-already-in-use') {
                setErrors((prev) => ({ ...prev, email: 'This email is already registered.' }));
                document.getElementById('email')?.focus();
            }
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : 'Something went wrong. Please try again.';
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const fieldBorder = (name: SignupFieldName) =>
        touched[name] && errors[name] ? { borderColor: '#dc2626' } : undefined;

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            <AuthHeader variant="register" />
            <main className={styles.container}>
                <div className={styles.shell}>
                    <section className={styles.showcasePanel}>
                        <div className={styles.showcaseContent}>
                            <div className={styles.showcaseLogo} aria-hidden="true">⚡</div>
                            <p className={styles.label}>NEW USER SPECIAL</p>
                            <h1 className={styles.showcaseTitle}>
                                Fresh groceries at your door in 10 minutes.
                            </h1>
                            <p className={styles.showcaseSubtitle}>
                                Join SpeedyGrocer for farm-fresh produce, everyday essentials,
                                and a little more time back in your day.
                            </p>
                            <Image
                                src={heroImage}
                                alt="A grocery bag filled with fresh produce and everyday essentials"
                                width={512}
                                height={382}
                                priority
                                style={{ width: '100%', height: 'auto', marginTop: 20, objectFit: 'contain' }}
                            />
                            <div style={{ marginTop: 28, textAlign: 'left' }}>
                                <p style={{ marginBottom: 14, fontWeight: 700, color: 'var(--c-brand-dark)' }}>
                                    🎉 Flat ₹100 off your first 3 orders
                                </p>
                                <p style={{ marginBottom: 10, color: 'var(--c-muted)' }}>⚡ Delivered in 8-12 minutes</p>
                                <p style={{ marginBottom: 10, color: 'var(--c-muted)' }}>🏷️ Wholesale prices on 5,000+ essentials</p>
                                <p style={{ color: 'var(--c-muted)' }}>✓ Quality checked, from farm to doorstep</p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.formPanel}>
                        <div className={styles.card}>
                            <header className={styles.header}>
                                <div className={styles.logo} aria-hidden="true">🛒</div>
                                <h2 className={styles.title}>Create your account</h2>
                                <p className={styles.subtitle}>
                                    A quick 30-second setup to get your first delivery moving.
                                </p>
                            </header>

                            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="fullName">Full name</label>
                                    <div className={styles.phoneField} style={fieldBorder('fullName')}>
                                        <input
                                            className={styles.phoneInput}
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            autoComplete="name"
                                            placeholder="e.g. John Doe"
                                            value={values.fullName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(touched.fullName && errors.fullName)}
                                            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    {touched.fullName && errors.fullName && (
                                        <p className={styles.error} id="fullName-error" role="alert">{errors.fullName}</p>
                                    )}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="email">Email address</label>
                                    <div className={styles.phoneField} style={fieldBorder('email')}>
                                        <input
                                            className={styles.phoneInput}
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(touched.email && errors.email)}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    <p className={styles.hint}>For sign-in, tax invoices and order receipts.</p>
                                    {touched.email && errors.email && (
                                        <p className={styles.error} id="email-error" role="alert">{errors.email}</p>
                                    )}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="password">Password</label>
                                    <div className={styles.phoneField} style={fieldBorder('password')}>
                                        <input
                                            className={styles.phoneInput}
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="At least 8 characters"
                                            value={values.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(touched.password && errors.password)}
                                            aria-describedby={errors.password ? 'password-error' : undefined}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    <p className={styles.hint}>Use letters and numbers, 8 characters or more.</p>
                                    {touched.password && errors.password && (
                                        <p className={styles.error} id="password-error" role="alert">{errors.password}</p>
                                    )}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="mobileNumber">Mobile number <span>(optional)</span></label>
                                    <div className={styles.phoneField} style={fieldBorder('mobileNumber')}>
                                        <span className={styles.countryCode}>
                                            <span role="img" aria-label="India flag">🇮🇳</span> +91
                                        </span>
                                        <input
                                            className={styles.phoneInput}
                                            id="mobileNumber"
                                            name="mobileNumber"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel-national"
                                            maxLength={10}
                                            placeholder="98765 43210"
                                            value={values.mobileNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(touched.mobileNumber && errors.mobileNumber)}
                                            aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : undefined}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <p className={styles.hint}>Helps our delivery partner reach you.</p>
                                    {touched.mobileNumber && errors.mobileNumber && (
                                        <p className={styles.error} id="mobileNumber-error" role="alert">{errors.mobileNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <button
                                        className={styles.link}
                                        type="button"
                                        onClick={toggleReferral}
                                        aria-expanded={showReferral}
                                        disabled={isLoading}
                                    >
                                        {showReferral ? '− Remove referral code' : '+ Have a referral code?'}
                                    </button>
                                    {showReferral && (
                                        <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                                            <label className={styles.label} htmlFor="referralCode">Referral code</label>
                                            <div className={styles.phoneField} style={fieldBorder('referralCode')}>
                                                <input
                                                    className={styles.phoneInput}
                                                    id="referralCode"
                                                    name="referralCode"
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder="Enter code"
                                                    value={values.referralCode}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    aria-invalid={Boolean(touched.referralCode && errors.referralCode)}
                                                    aria-describedby={errors.referralCode ? 'referralCode-error' : undefined}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {touched.referralCode && errors.referralCode && (
                                                <p className={styles.error} id="referralCode-error" role="alert">{errors.referralCode}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <label className={styles.checkboxLabel} htmlFor="whatsappConsent">
                                    <input
                                        className={styles.checkbox}
                                        id="whatsappConsent"
                                        name="whatsappConsent"
                                        type="checkbox"
                                        checked={whatsappConsent}
                                        onChange={(event) => setWhatsappConsent(event.target.checked)}
                                        disabled={isLoading}
                                    />
                                    Send me delivery updates and offers on WhatsApp (if I add a number).
                                </label>

                                <button className={styles.submitBtn} type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating account...' : <>Create account <span aria-hidden="true">→</span></>}
                                </button>
                            </form>

                            <div className={styles.securityFooter}>
                                <span className={styles.securityNote}>🔒 256-bit encrypted and privacy protected</span>
                            </div>

                            <p className={styles.footer}>
                                Already have an account? <a href="/auth/login">Log in</a>
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}