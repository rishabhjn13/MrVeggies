'use client';

import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
    return (
        <div className={styles.spinnerContainer}>
            <div className={styles.spinnerWrapper}>
                {/* Main Spinner */}
                <div className={styles.spinner}>
                </div>

                {/* Brand Logo / Icon in center */}
                <div className={styles.brandIcon}>🛒</div>
            </div>

            <div className={styles.text}>
                Fresh groceries <span className={styles.highlight}>on the way...</span>
            </div>

            <p className={styles.subtext}>Usually takes 10 seconds or less</p>
        </div>
    );
};

export default LoadingSpinner;