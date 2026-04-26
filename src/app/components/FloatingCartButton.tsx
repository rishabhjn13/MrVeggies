'use client';

import React from 'react';
import styles from './FloatingCartButton.module.css';

interface FloatingCartButtonProps {
    itemCount?: number;
    onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
    itemCount = 0,
    onClick,
}) => {
    return (
        <button
            className={styles.floatingCartBtn}
            onClick={onClick}
            aria-label="Open Cart"
        >
            <div className={styles.iconWrapper}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
            </div>

            {itemCount > 0 && (
                <div className={styles.badge}>
                    {itemCount > 99 ? '99+' : itemCount}
                </div>
            )}
        </button>
    );
};

export default FloatingCartButton;