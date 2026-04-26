'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { cn } from "../../utils/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import CartSidebar from "./CartSidebar";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
    { label: "Explore", href: "#categories" },
    { label: "Offers", href: "#deals" },
    { label: "How it works", href: "#how-it-works" },
];

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    // const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<string | null>("St. Mungo's Hospital, London");
    const user = useAuthStore((state) => state.user);

    const updateAddress = () => {
        // Optional: Set loading state
        // setIsLoading(true);
        // setCurrentAddress("Fetching location...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse Geocoding using Nominatim (OpenStreetMap) - Free & No API Key
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?` +
                        `format=jsonv2&` +
                        `lat=${latitude}&` +
                        `lon=${longitude}&` +
                        `addressdetails=1&` +     // Get detailed address parts
                        `zoom=18`                 // Higher zoom = more precise address
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch address");
                    }

                    const data = await response.json();

                    if (data && data.address) {
                        const addr = data.address;

                        // Build a nice readable address (customize as per your needs)
                        const addressParts = [
                            addr.road || addr.neighbourhood || addr.suburb,
                            addr.city || addr.town || addr.village || addr.county,
                            addr.state || addr.state_district,
                            addr.postcode
                        ].filter(Boolean); // Remove empty values

                        const formattedAddress = addressParts.join(", ");

                        // Or use the full display name (often cleaner)
                        // const formattedAddress = data.display_name;

                        setCurrentAddress(formattedAddress || "Address not found");
                    } else {
                        setCurrentAddress("Could not determine address");
                    }
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                    setCurrentAddress("Failed to fetch address. Please try again.");
                }
                // finally {
                //   setIsLoading(false);
                // }
            },

            (error) => {
                console.error("Geolocation error:", error.message);

                let errorMsg = "Failed to get location";

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = "Location access denied. Please allow location permission.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = "Location information unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMsg = "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMsg = "Unable to retrieve your location.";
                }

                setCurrentAddress(errorMsg);
                // setIsLoading(false);
            },

            {
                enableHighAccuracy: true,   // Best accuracy (uses GPS)
                timeout: 15000,             // 15 seconds
                maximumAge: 0               // Don't use cached location
            }
        );
    };

    useEffect(() => {
        updateAddress(); 
    }, []);

    const {
        isCartOpen,
        openCart,
        closeCart,
        cartItems,
        updateQuantity,
        removeFromCart
    } = useCart();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={cn(styles.nav, scrolled && styles.navScrolled)}>
            <CartSidebar
                isOpen={isCartOpen}
                onClose={closeCart}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
            />
            <div className={styles.inner}>
                <Link href="/" className={styles.logo} aria-label="Zapp home">
                    MrVeggies<span className={styles.logoDot}>.</span>
                </Link>

                <ul className={styles.links} role="list">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <a href={link.href} className={styles.link}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className={styles.actions}>
                    {user ? (
                        <>
                            {/* Cart Button - Dark/Brand Background */}
                            <button className={styles.cartButton} onClick={openCart}>
                                <span className={styles.cartText}>Cart</span>
                                <div className={styles.cartIconWrapper}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
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
                            </button>

                            {/* Profile Button - Light Style */}
                            <Link href="/dashboard" className={styles.profileButton}>
                                <span className={styles.profileText}>{user?.displayName || 'Profile'}</span>
                                <div className={styles.profileIconWrapper}>
                                    <Image src={user?.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} alt="Profile" width={32} height={32} className={styles.profileImage} />
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className={styles.signIn}>
                                Sign In
                            </Link>

                            <Link href="/search" className={styles.cta}>
                                Order Now
                            </Link>
                        </>

                    )}
                </div>
            </div>
            <div className={styles.addressSelector}>
                <span className={styles.addressText}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.locationIcon}
                    >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className={styles.addressContent}>
                        {currentAddress}
                    </span>
                </span>
                <span
                    className={styles.updateBtn}
                    onClick={() => updateAddress()}   // Empty function as requested
                >
                    Update
                </span>
            </div>
        </nav>
    );
};

export default Navbar;