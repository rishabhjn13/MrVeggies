'use client';

import React from 'react';
import styles from './AuthForm.module.css';

interface AuthFormProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    title,
    subtitle,
    children,
    footer,
    onSubmit,
    isLoading = false,
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>🛒</div>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                <form onSubmit={onSubmit} className={styles.form}>
                    {children}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Please wait...' : title}
                    </button>
                </form>

                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );
};