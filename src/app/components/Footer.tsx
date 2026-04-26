import React from "react";
import styles from "./Footer.module.css";
import Link from "next/link";

const FOOTER_LINKS = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
];

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo} aria-label="MrVeggies home">
                    MrVeggies<span className={styles.logoDot}>.</span>
                </Link>

                <nav aria-label="Footer navigation">
                    <ul className={styles.links} role="list">
                        {FOOTER_LINKS.map((link) => (
                            <li key={link.label}>
                                <Link href={link.href} className={styles.link}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <p className={styles.copy}>
                    © {year} MrVeggies Technologies Pvt Ltd. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;