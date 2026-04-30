'use client';

import React from "react";
import styles from "./Footer.module.css";
import Link from "next/link";

const FOOTER_COLS = [
    {
        heading: "Company",
        links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Press", href: "#" },
        ],
    },
    {
        heading: "Support",
        links: [
            { label: "Help Centre", href: "#" },
            { label: "Track Orders", href: "/track-orders" },
            { label: "Write to Us", href: "/write-to-us" },
            { label: "Returns", href: "#" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "Cookie Policy", href: "#" },
            { label: "Refund Policy", href: "#" },
        ],
    },
];

const SOCIAL = [
    {
        label: "Instagram",
        href: "#",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
        ),
    },
    {
        label: "Twitter / X",
        href: "#",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        label: "LinkedIn",
        href: "#",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </svg>
        ),
    },
    {
        label: "YouTube",
        href: "#",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
            </svg>
        ),
    },
];

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            {/* Top wave divider */}
            <div className={styles.waveDivider} aria-hidden>
                <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 40 C360 0 1080 0 1440 40 L1440 0 L0 0 Z" fill="var(--c-bg)" />
                </svg>
            </div>

            <div className={styles.inner}>

                {/* ── Brand column ── */}
                <div className={styles.brandCol}>
                    <Link href="/" className={styles.logo} aria-label="MrVeggies home">
                        <span className={styles.logoMark}>M</span>
                        <span className={styles.logoText}>
                            rVeggies<span className={styles.logoDot}>.</span>
                        </span>
                    </Link>
                    <p className={styles.tagline}>
                        Fresh vegetables & groceries delivered to your door in minutes.
                    </p>

                    {/* App download pills */}
                    <div className={styles.appBadges}>
                        <a href="#" className={styles.appBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            App Store
                        </a>
                        <a href="#" className={styles.appBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.18 23.76c.31.17.67.19 1.01.04l11.81-6.82-2.56-2.56-10.26 9.34zM.58 1.38C.22 1.7 0 2.2 0 2.86v18.28c0 .66.22 1.16.58 1.48l.08.07L10.55 12.7v-.24L.66 1.31l-.08.07zM20.29 10.37l-2.68-1.55-2.85 2.85 2.85 2.85 2.7-1.56c.77-.44.77-1.16-.02-1.59zM4.19.24L16.01 7.06l-2.56 2.56L3.18.24C3.53.09 3.88.12 4.19.24z" />
                            </svg>
                            Google Play
                        </a>
                    </div>

                    {/* Social icons */}
                    <div className={styles.socials}>
                        {SOCIAL.map((s) => (
                            <a key={s.label} href={s.href} className={styles.socialIcon} aria-label={s.label} title={s.label}>
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Link columns ── */}
                <div className={styles.linksGrid}>
                    {FOOTER_COLS.map((col) => (
                        <div key={col.heading} className={styles.linkCol}>
                            <p className={styles.colHeading}>{col.heading}</p>
                            <ul className={styles.colLinks} role="list">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className={styles.colLink}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>

            {/* ── Bottom bar ── */}
            <div className={styles.bottomBar}>
                <div className={styles.bottomInner}>
                    <p className={styles.copy}>
                        © {year} MrVeggies Technologies Pvt. Ltd. All rights reserved.
                    </p>
                    <div className={styles.bottomRight}>
                        <span className={styles.madeWith}>
                            Made with
                            <span className={styles.heart} aria-label="love">♥</span>
                            in India
                        </span>
                        <span className={styles.bottomDot} aria-hidden />
                        <span className={styles.fssai}>
                            FSSAI Licensed · Reg. No. 10020042009941
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;