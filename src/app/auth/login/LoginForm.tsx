'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import styles from './page.module.css';
import AuthHeader from '@/app/components/AuthHeader';
import { resetPassword, signInWithEmail, signInWithGoogle } from '@/lib/auth';

const REDIRECT_AFTER_LOGIN = '/';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type LoginErrors = {
    email?: string;
    password?: string;
};

const maskEmail = (email: string) => email.replace(/^(.).*(@.*)$/, '$1***$2');

function getLoginErrorMessage(code: string): string {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password. Please try again.';
        case 'auth/invalid-email':
            return 'That email address looks invalid.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection and try again.';
        default:
            return 'Failed to log in. Please try again.';
    }
}

function getGoogleErrorMessage(code: string): string {
    switch (code) {
        case 'auth/popup-blocked':
            return 'Your browser blocked the Google popup. Allow popups and try again.';
        case 'auth/account-exists-with-different-credential':
            return 'An account already exists with this email. Log in with your password instead.';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection and try again.';
        default:
            return 'Google sign in failed. Please try again.';
    }
}

const getErrorCode = (error: unknown) => (error as { code?: string })?.code ?? 'unknown';

export default function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberDevice, setRememberDevice] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [formError, setFormError] = useState('');

    const validate = (): LoginErrors => {
        const result: LoginErrors = {};
        const trimmedEmail = email.trim();

        if (!trimmedEmail) result.email = 'Please enter your email address.';
        else if (!EMAIL_REGEX.test(trimmedEmail)) result.email = 'Enter a valid email like name@example.com.';

        if (!password) result.password = 'Please enter your password.';

        return result;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        if (formError) setFormError('');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        if (formError) setFormError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        console.log('[Login] Form submitted, running validation...');
        setFormError('');

        const validationErrors = validate();
        setErrors(validationErrors);

        if (validationErrors.email || validationErrors.password) {
            console.error('[Login] Validation failed:', validationErrors);
            toast.error(validationErrors.email ?? validationErrors.password ?? 'Please fix the errors.');
            document.getElementById(validationErrors.email ? 'email' : 'password')?.focus();
            return;
        }

        const cleanEmail = email.trim().toLowerCase();

        setIsLoading(true);
        const toastId = toast.loading('Logging you in...');

        try {
            console.log('[Login] Signing in', maskEmail(cleanEmail), { rememberDevice });
            const credential = await signInWithEmail(cleanEmail, password, rememberDevice);
            console.log('[Login] Signed in, uid:', credential.user.uid);

            const firstName = credential.user.displayName?.split(' ')[0];
            toast.success(firstName ? `Welcome back, ${firstName}!` : 'Welcome back!', { id: toastId });
            router.push(REDIRECT_AFTER_LOGIN);
        } catch (err) {
            const code = getErrorCode(err);
            console.error('[Login] Firebase login failed:', code, err);
            const message = getLoginErrorMessage(code);
            setFormError(message);
            toast.error(message, { id: toastId });
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setFormError('');
        const toastId = toast.loading('Opening Google...');

        try {
            const credential = await signInWithGoogle(rememberDevice);
            console.log('[Login] Google sign in succeeded, uid:', credential.user.uid);

            const firstName = credential.user.displayName?.split(' ')[0];
            toast.success(firstName ? `Welcome, ${firstName}!` : 'Welcome!', { id: toastId });
            router.push(REDIRECT_AFTER_LOGIN);
        } catch (err) {
            const code = getErrorCode(err);
            console.error('[Login] Google sign in failed:', code, err);

            if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
                toast.dismiss(toastId); // user cancelled, not an error
            } else {
                const message = getGoogleErrorMessage(code);
                setFormError(message);
                toast.error(message, { id: toastId });
            }
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (isLoading) return;

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
            console.warn('[Login] Forgot password needs a valid email first.');
            setErrors((prev) => ({ ...prev, email: 'Enter your email above to reset your password.' }));
            toast.error('Enter your email above to reset your password.');
            document.getElementById('email')?.focus();
            return;
        }

        const toastId = toast.loading('Sending reset link...');
        try {
            await resetPassword(cleanEmail);
            console.log('[Login] Password reset email requested for', maskEmail(cleanEmail));
            // Generic wording so we do not reveal whether an account exists
            toast.success('If an account exists for this email, a reset link is on its way.', { id: toastId });
        } catch (err) {
            const code = getErrorCode(err);
            console.error('[Login] Password reset failed:', code, err);
            const message =
                code === 'auth/too-many-requests'
                    ? 'Too many requests. Please try again later.'
                    : code === 'auth/network-request-failed'
                        ? 'Network error. Check your connection and try again.'
                        : code === 'auth/invalid-email'
                            ? 'That email address looks invalid.'
                            : 'Could not send the reset link. Please try again.';
            toast.error(message, { id: toastId });
        }
    };

    const fieldBorder = (hasError?: string) => (hasError ? { borderColor: '#dc2626' } : undefined);

    return (
        <div>
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            <AuthHeader variant="login" />
            <div className={styles.container}>
                <div className={styles.shell}>
                    {/* Left showcase panel */}
                    <section className={styles.showcasePanel}>
                        <div className={styles.showcaseContent}>
                            <div className={styles.showcaseLogo}>⚡</div>
                            <h2 className={styles.showcaseTitle}>
                                Farm-fresh groceries at lightning pace.
                            </h2>
                            <p className={styles.showcaseSubtitle}>
                                From bakery loaves to fresh dairy & produce, packed and
                                dispatched in under 120 seconds.
                            </p>
                        </div>
                    </section>

                    {/* Right login form panel */}
                    <section className={styles.formPanel}>
                        <div className={styles.card}>
                            <div className={styles.header}>
                                <div className={styles.logo}>🛒</div>
                                <h1 className={styles.title}>Welcome Back</h1>
                                <p className={styles.subtitle}>
                                    Login to access your saved addresses, past orders, and
                                    instant 10-minute delivery.
                                </p>
                            </div>

                            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="email">
                                        Email Address
                                    </label>

                                    <div className={styles.phoneField} style={fieldBorder(errors.email)}>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="Enter your email"
                                            className={styles.phoneInput}
                                            value={email}
                                            onChange={handleEmailChange}
                                            aria-invalid={Boolean(errors.email)}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className={styles.error} id="email-error" role="alert">{errors.email}</p>
                                    )}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="password">
                                        Password
                                    </label>

                                    <div className={styles.phoneField} style={fieldBorder(errors.password)}>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className={styles.phoneInput}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            aria-invalid={Boolean(errors.password)}
                                            aria-describedby={errors.password ? 'password-error' : undefined}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className={styles.error} id="password-error" role="alert">{errors.password}</p>
                                    )}
                                    {formError && <p className={styles.error} role="alert">{formError}</p>}
                                </div>

                                <div className={styles.checkboxRow}>
                                    <label
                                        className={styles.checkboxLabel}
                                        htmlFor="rememberDevice"
                                    >
                                        <input
                                            id="rememberDevice"
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={rememberDevice}
                                            onChange={(e) =>
                                                setRememberDevice(e.target.checked)
                                            }
                                            disabled={isLoading}
                                        />
                                        Remember this device
                                    </label>
                                    <button
                                        type="button"
                                        className={styles.link}
                                        onClick={handleForgotPassword}
                                        disabled={isLoading}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Log In'}
                                </button>
                            </form>

                            <div className={styles.divider}>or quick login with</div>

                            <div className={styles.providerGrid}>
                                <button
                                    type="button"
                                    className={styles.googleBtn}
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    style={{ width: '100%' }}
                                >
                                    <span className={styles.googleIcon}>
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                    </span>
                                    Continue with Google
                                </button>
                            </div>

                            <div className={styles.securityFooter}>
                                <span className={styles.securityNote}>
                                    🔒 Secure 256-bit encrypted authentication
                                </span>
                                <a className={styles.helpLink} href="#support">
                                    Trouble logging in? Get help ↗
                                </a>
                            </div>

                            <p className={styles.footer}>
                                Don&apos;t have an account? <a href="/auth/signup">Sign up</a>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}