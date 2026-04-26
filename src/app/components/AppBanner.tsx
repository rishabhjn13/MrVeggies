import React from "react";
import styles from "./AppBanner.module.css";

interface RatingStat {
    value: string;
    stars?: boolean;
    label: string;
}

const RATINGS: RatingStat[] = [
    { value: "4.8", stars: true, label: "App Store" },
    { value: "4.7", stars: true, label: "Google Play" },
    { value: "2M+", stars: false, label: "Active users" },
];

const AppBanner: React.FC = () => {
    return (
        <section className={styles.section}>
            <div className={styles.inner}>
                <div className={styles.banner}>
                    {/* Text */}
                    <div className={styles.textBlock}>
                        <div className="section-tag">Get the app</div>
                        <h2 className="section-title">Even faster on mobile.</h2>
                        <p className="section-sub">
                            One-tap reorders, live tracking and exclusive app-only deals.
                            Download free.
                        </p>

                        <div className={styles.storeBtns}>
                            <button className={styles.storeBtn} aria-label="Download on App Store">
                                <span className={styles.storeIcon} aria-hidden="true">🍎</span>
                                <span className={styles.storeLabel}>
                                    <span className={styles.storeSub}>Download on the</span>
                                    <span className={styles.storeName}>App Store</span>
                                </span>
                            </button>

                            <button className={styles.storeBtn} aria-label="Get it on Google Play">
                                <span className={styles.storeIcon} aria-hidden="true">▶</span>
                                <span className={styles.storeLabel}>
                                    <span className={styles.storeSub}>Get it on</span>
                                    <span className={styles.storeName}>Google Play</span>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Ratings */}
                    <div className={styles.ratingsBlock}>
                        {RATINGS.map((r) => (
                            <div key={r.label} className={styles.ratingBox}>
                                <span className={styles.ratingNum}>{r.value}</span>
                                {r.stars ? (
                                    <span className={styles.ratingStars} aria-label="5 stars">
                                        ★★★★★
                                    </span>
                                ) : (
                                    <span className={styles.ratingDots} aria-hidden="true">
                                        ●●●●●
                                    </span>
                                )}
                                <span className={styles.ratingLabel}>{r.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppBanner;