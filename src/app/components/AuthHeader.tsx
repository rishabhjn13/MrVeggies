'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AuthHeader.module.css';

type AuthHeaderProps = {
    /** Optional override. If omitted, it's inferred from the current route. */
    variant?: 'login' | 'register';
};

export default function AuthHeader({ variant }: AuthHeaderProps) {
    const pathname = usePathname();
    const isLogin = variant ? variant === 'login' : !pathname?.startsWith('/auth/signup');

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.brand} aria-label="MrVeggies home">
                    <span className={styles.brandIcon} aria-hidden="true">
                        🌱
                    </span>
                    <span>MrVeggies</span>
                </Link>

                <p className={styles.prompt}>
                    <span className={styles.promptText}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    </span>
                    <Link href={isLogin ? '/auth/signup' : '/auth/login'} className={styles.link}>
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </Link>
                </p>
            </div>
        </header>
    );
}