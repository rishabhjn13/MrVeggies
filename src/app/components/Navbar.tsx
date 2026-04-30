'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { cn } from "../../utils/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import CartSidebar from "./CartSidebar";
import { useCart } from "@/context/CartContext";
import { useCartStore } from "@/store/useCartStore";

const NAV_LINKS = [
    { label: "Explore", href: "#categories" },
    { label: "Offers", href: "#deals" },
    { label: "How it works", href: "#how-it-works" },
];

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<string | null>("St. Mungo's Hospital, London");
    const [addressLoading, setAddressLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const user = useAuthStore((state) => state.user);

    const updateAddress = () => {
        setAddressLoading(true);
        setCurrentAddress("Locating…");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`
                    );
                    if (!response.ok) throw new Error("Failed to fetch address");
                    const data = await response.json();
                    if (data?.address) {
                        const addr = data.address;
                        const parts = [
                            addr.road || addr.neighbourhood || addr.suburb,
                            addr.city || addr.town || addr.village || addr.county,
                            addr.state,
                            addr.postcode,
                        ].filter(Boolean);
                        setCurrentAddress(parts.join(", ") || "Address not found");
                    } else {
                        setCurrentAddress("Could not determine address");
                    }
                } catch {
                    setCurrentAddress("Failed to fetch address");
                } finally {
                    setAddressLoading(false);
                }
            },
            (error) => {
                const msgs: Record<number, string> = {
                    1: "Location access denied",
                    2: "Location unavailable",
                    3: "Location timed out",
                };
                setCurrentAddress(msgs[error.code] || "Unable to retrieve location");
                setAddressLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    useEffect(() => { updateAddress(); }, []);

    const { items } = useCartStore();
    const { isCartOpen, openCart, closeCart } = useCart();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* Close mobile menu on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* Lock body scroll when menu is open */
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const totalItems = items.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

    return (
        <>
            {/* Mobile menu backdrop */}
            <div
                className={cn(styles.backdrop, menuOpen && styles.backdropVisible)}
                onClick={() => setMenuOpen(false)}
                aria-hidden
            />

            <nav className={cn(styles.nav, scrolled && styles.navScrolled)} ref={menuRef}>
                <CartSidebar isOpen={isCartOpen} onClose={closeCart} />

                <div className={styles.inner}>

                    {/* ── Logo ── */}
                    <Link href="/" className={styles.logo} aria-label="MrVeggies home">
                        <span className={styles.logoMark}>M</span>
                        <span className={styles.logoText}>
                            rVeggies<span className={styles.logoDot}>.</span>
                        </span>
                    </Link>

                    {/* ── Desktop Nav Links ── */}
                    <ul className={styles.links} role="list">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} className={styles.link}>
                                    {link.label}
                                    <span className={styles.linkUnderline} />
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* ── Address pill (desktop) ── */}
                    <div className={styles.addressPill}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.pinIcon}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className={styles.addressText}>{currentAddress}</span>
                        <button
                            className={cn(styles.updateBtn, addressLoading && styles.updateBtnSpinning)}
                            onClick={updateAddress}
                            aria-label="Update location"
                            title="Update location"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6" />
                                <path d="M1 20v-6h6" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                        </button>
                    </div>

                    {/* ── Actions ── */}
                    <div className={styles.actions}>
                        {user ? (
                            <>
                                <button className={styles.cartBtn} onClick={openCart} aria-label={`Cart, ${totalItems} items`}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="8" cy="21" r="1" />
                                        <circle cx="19" cy="21" r="1" />
                                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                    </svg>
                                    <span className={styles.cartLabel}>Cart</span>
                                    {totalItems > 0 && (
                                        <span className={styles.cartBadge}>{totalItems}</span>
                                    )}
                                </button>

                                <Link href="/dashboard" className={styles.profileBtn}>
                                    <Image
                                        src={user?.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                        alt="Profile"
                                        width={32}
                                        height={32}
                                        className={styles.profileImg}
                                    />
                                    <span className={styles.profileName}>{user?.displayName?.split(" ")[0] || "Profile"}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className={styles.signInBtn}>Sign In</Link>
                                <Link href="/search" className={styles.ctaBtn}>
                                    Order Now
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </>
                        )}

                        {/* ── Hamburger ── */}
                        <button
                            className={cn(styles.hamburger, menuOpen && styles.hamburgerOpen)}
                            onClick={() => setMenuOpen(v => !v)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                        >
                            <span className={styles.hLine} />
                            <span className={styles.hLine} />
                            <span className={styles.hLine} />
                        </button>
                    </div>
                </div>

                {/* ── Mobile Drawer ── */}
                <div className={cn(styles.drawer, menuOpen && styles.drawerOpen)} aria-hidden={!menuOpen}>
                    {/* Mobile address */}
                    <div className={styles.drawerAddress}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{currentAddress}</span>
                        <button
                            className={cn(styles.updateBtn, addressLoading && styles.updateBtnSpinning)}
                            onClick={updateAddress}
                            aria-label="Update location"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                        </button>
                    </div>

                    <div className={styles.drawerDivider} />

                    {/* Mobile nav links */}
                    <ul className={styles.drawerLinks} role="list">
                        {NAV_LINKS.map((link, i) => (
                            <li key={link.href} style={{ '--delay': `${i * 0.06}s` } as React.CSSProperties}>
                                <a
                                    href={link.href}
                                    className={styles.drawerLink}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className={styles.drawerDivider} />

                    {/* Mobile auth actions */}
                    <div className={styles.drawerActions}>
                        {user ? (
                            <>
                                <button
                                    className={styles.drawerCartBtn}
                                    onClick={() => { openCart(); setMenuOpen(false); }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                    </svg>
                                    View Cart
                                    {totalItems > 0 && <span className={styles.drawerCartBadge}>{totalItems}</span>}
                                </button>
                                <Link href="/dashboard" className={styles.drawerProfileBtn} onClick={() => setMenuOpen(false)}>
                                    <Image
                                        src={user?.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                        alt="Profile"
                                        width={28}
                                        height={28}
                                        className={styles.profileImg}
                                    />
                                    {user?.displayName || "My Profile"}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className={styles.drawerSignIn} onClick={() => setMenuOpen(false)}>
                                    Sign In
                                </Link>
                                <Link href="/search" className={styles.drawerCta} onClick={() => setMenuOpen(false)}>
                                    Order Now
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;