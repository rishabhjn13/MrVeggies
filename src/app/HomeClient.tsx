'use client';

import "../styles/animations.css";
import "../styles/components.css";
import "./globals.css";

import AppBanner from "./components/AppBanner";
import CategoryStrip from "./components/Category";
import DealsSection from "./components/DealsSection";
import FloatingCartButton from "./components/FloatingCartButton";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Navbar from "./components/Navbar";
import { useCart } from "@/context/CartContext";

export default function HomeClient() {
    const { openCart, getTotalItems } = useCart();

    return (
        <>
            <Navbar />

            <main>
                <FloatingCartButton
                    itemCount={getTotalItems()}
                    onClick={openCart}
                />
                <Hero />
                <CategoryStrip />
                <DealsSection />
                <HowItWorks />
                <AppBanner />
            </main>

            <Footer />
        </>
    );
}