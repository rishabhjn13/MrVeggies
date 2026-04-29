'use client';

import React from "react";

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

const App: React.FC = () => {
  const { openCart } = useCart();
  return (
    <>
      <Navbar />

      <main>
        <FloatingCartButton
          itemCount={useCart().getTotalItems()}
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
};

export default App;