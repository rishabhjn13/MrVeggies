import React from "react";
import styles from "./HowItWorks.module.css";

interface Step {
    num: string;
    emoji: string;
    title: string;
    description: string;
}

const STEPS: Step[] = [
    {
        num: "01",
        emoji: "📍",
        title: "Set your location",
        description:
            "Drop your pin and we'll show you everything available in your area right now.",
    },
    {
        num: "02",
        emoji: "🛒",
        title: "Fill your cart",
        description:
            "Browse thousands of products across fresh produce, dairy, snacks and more.",
    },
    {
        num: "03",
        emoji: "⚡",
        title: "Order & relax",
        description:
            "Place your order in seconds. Our riders pick, pack and deliver in under 10 mins.",
    },
    {
        num: "04",
        emoji: "💚",
        title: "Enjoy & repeat",
        description:
            "Rate your experience, save your favourites and get personalised deals next time.",
    },
];

const HowItWorks: React.FC = () => {
    return (
        <section className={styles.section} id="how-it-works">
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <div className={styles.sectionTag}>How it works</div>
                    <h2 className={styles.title}>Three steps to your door.</h2>
                    <p className={styles.sub}>
                        We&lsquo;ve made it embarrassingly simple to get fresh groceries.
                    </p>
                </div>

                <div className={styles.grid}>
                    {STEPS.map((step) => (
                        <div key={step.num} className={styles.step}>
                            <span className={styles.stepNum} aria-hidden="true">
                                {step.num}
                            </span>
                            <span className={styles.stepEmoji} aria-hidden="true">
                                {step.emoji}
                            </span>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDesc}>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;