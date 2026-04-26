'use client';

import React, { useState } from "react";
import styles from "./DealsSection.module.css";
import { formatPrice, discountPercent } from "../../utils/helpers";

export interface Deal {
    id: string;
    emoji: string;
    name: string;
    weight: string;
    price: number;
    originalPrice: number;
    bg: string;
}

export const DEALS: Deal[] = [
    { id: "avocado", emoji: "🥑", name: "Hass Avocados", weight: "Pack of 3", price: 79, originalPrice: 99, bg: "#FFF3EE" },
    { id: "blueberry", emoji: "🫐", name: "Fresh Blueberries", weight: "125g punnet", price: 129, originalPrice: 149, bg: "#E6F7F2" },
    { id: "cheddar", emoji: "🧀", name: "Cheddar Block", weight: "200g", price: 189, originalPrice: 269, bg: "#FFF8E6" },
    { id: "salad", emoji: "🥗", name: "Salad Mix Bag", weight: "250g ready-to-eat", price: 89, originalPrice: 99, bg: "#F0EEFF" },
    { id: "strawberry", emoji: "🍓", name: "Strawberries", weight: "200g punnet", price: 109, originalPrice: 145, bg: "#FFE9EE" },
];

interface DealCardProps {
    deal: Deal;
    onAdd: (deal: Deal) => void;
    cartCount: number;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onAdd, cartCount }) => {
    const discount = discountPercent(deal.originalPrice, deal.price);

    return (
        <article className={styles.card}>
            <div className={styles.imgArea} style={{ background: deal.bg }}>
                <span className={styles.discountBadge}>{discount}% off</span>
                <span className={styles.productEmoji} aria-label={deal.name}>{deal.emoji}</span>
            </div>

            <div className={styles.body}>
                <p className={styles.productName}>{deal.name}</p>
                <p className={styles.weight}>{deal.weight}</p>

                <div className={styles.footer}>
                    <div className={styles.priceBlock}>
                        <span className={styles.priceNow}>{formatPrice(deal.price)}</span>
                        <span className={styles.priceWas}>{formatPrice(deal.originalPrice)}</span>
                    </div>

                    <button
                        className={styles.addBtn}
                        onClick={() => onAdd(deal)}
                        aria-label={`Add ${deal.name} to cart`}
                    >
                        {cartCount > 0 ? (
                            <span className={styles.cartCount}>{cartCount}</span>
                        ) : (
                            "+"
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
};

const DealsSection: React.FC = () => {
    const [cart, setCart] = useState<Record<string, number>>({});

    const handleAdd = (deal: Deal) => {
        setCart((prev) => ({ ...prev, [deal.id]: (prev[deal.id] ?? 0) + 1 }));
    };

    return (
        <section className={styles.section} id="deals">
            <div className={styles.inner}>
                <div className="section-tag">Today&apos;s deals</div>
                <h2 className="section-title">Fresh picks, hot prices.</h2>
                <p className="section-sub">
                    Limited-time discounts on things you actually need.
                </p>

                <div className={styles.grid}>
                    {DEALS.map((deal) => (
                        <DealCard
                            key={deal.id}
                            deal={deal}
                            onAdd={handleAdd}
                            cartCount={cart[deal.id] ?? 0}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DealsSection;