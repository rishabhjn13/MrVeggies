'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/app/components/auth/AuthForm";
import { signInWithGoogle, signUpWithEmail } from "@/services/lib/auth";
import styles from "@/app/components/auth/AuthForm.module.css";

import toast, { Toaster } from "react-hot-toast";
import { FirebaseError } from "firebase/app";


const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setLoading] = useState(false);
    const router = useRouter();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);

        try {
            const result = await signInWithGoogle();
            if (!result?.user) {
                throw new Error("Google sign-in failed");
            }

            const token = await result.user.getIdToken();
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Backend login failed");
            }

            toast.success("Logged in successfully!");
            router.push("/dashboard");
            return result;
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof FirebaseError) {
                toast.error(error.message);
            } else {
                toast.error("Google login failed");
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);

        try {
            const result = await signUpWithEmail(email, password, name);
            const token = result?.user?.getIdToken ? await result.user.getIdToken() : null;

            if (token) {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Backend login failed");
                }
            }

            toast.success("Account created successfully!");
            router.push("/dashboard");

        } catch (error: unknown) {
            console.error(error);

            let errorMessage = "Invalid email or password";

            // Check if the error is an instance of FirebaseError
            if (error instanceof FirebaseError) {
                // Now 'error' is typed, and 'error.code' is safe to access
                if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                    errorMessage = "Invalid email or password";
                } else if (error.code === "auth/invalid-email") {
                    errorMessage = "Invalid email format";
                } else if (error.code === "auth/too-many-requests") {
                    errorMessage = "Too many attempts. Try again later.";
                } else {
                    errorMessage = error.message;
                }
            } else if (error instanceof Error) {
                // Handle standard JS errors
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthForm
            title="Create account"
            subtitle="Join thousands getting 10-min grocery delivery"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            footer={
                <>
                    Already have an account?{' '}
                    <Link href="/auth/login">Sign in</Link>
                </>
            }
        >
            <Toaster position="top-right" reverseOrder={false} />
            {/* Google OAuth Button */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className={styles.googleBtn}
            >
                {isGoogleLoading ? (
                    'Connecting to Google...'
                ) : (
                    <>
                        <span className={styles.googleIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.25 1.35-1 2.5-2.13 3.27v2.68h3.44c2.01-1.85 3.17-4.58 3.17-8.21z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.44-2.68c-.95.64-2.17 1.02-3.84 1.02-2.95 0-5.47-1.99-6.37-4.67H2.18v2.93C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.63 14.01c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18V6.72H2.18C1.43 8.24 1 10.06 1 12s.43 3.76 1.18 5.28l2.45-1.92z" fill="#FBBC05" />
                                <path d="M12 4.75c1.66 0 3.14.57 4.31 1.69l3.22-3.22C17.46 1.69 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.72l2.45 1.93c.9-2.68 3.42-4.67 6.37-4.67z" fill="#EA4335" />
                            </svg>
                        </span>
                        Continue with Google
                    </>
                )}
            </button>
            <div className={styles.divider}>or</div>
            <div className={styles.inputGroup}>
                <label className={styles.label}>Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" className={styles.input} required />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={styles.input} required />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" className={styles.input} required />
            </div>

        </AuthForm>
    );
};

export default SignupPage;