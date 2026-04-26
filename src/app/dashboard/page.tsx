'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { logout } from '@/services/lib/auth';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
            await logout();

            router.push('/');
            router.refresh();

        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setIsLoggingOut(false);
        }
    };
    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);
    // Find out whether it's good morning, afternoon or evening
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 18) return 'Afternoon';
        return 'Evening';
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.greeting}>
                            Good {getGreeting()}, {user?.displayName || 'User'} 👋
                        </h1>
                        <p className={styles.subgreeting}>Welcome to your MrVeggies account</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={styles.logoutBtn}
                    >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>

                {/* Quick Actions Grid */}
                <div className={styles.grid}>
                    {quickActions.map((action, index) => (
                        <Link href={action.href} key={index} className={styles.card}>
                            <div className={styles.cardIcon}>{action.icon}</div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{action.title}</h3>
                                <p className={styles.cardDesc}>{action.desc}</p>
                            </div>
                            <div className={styles.cardArrow}>→</div>
                        </Link>
                    ))}
                </div>

                {/* Stats Section */}
                <div className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>Your Activity</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>12</div>
                            <div className={styles.statLabel}>Orders Delivered</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>98%</div>
                            <div className={styles.statLabel}>On-time Rate</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>₹2,840</div>
                            <div className={styles.statLabel}>Saved this month</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const quickActions = [
    {
        title: "Edit Profile",
        desc: "Update your personal information",
        href: "/dashboard/edit-profile",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        )
    },
    {
        title: "Security & 2FA",
        desc: "Manage password and two-factor authentication",
        href: "/security",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        )
    },
    {
        title: "Track Orders",
        desc: "View and track your recent deliveries",
        href: "/orders",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M9 22v-4" />
                <path d="M15 22v-4" />
                <path d="M12 11v-4" />
            </svg>
        )
    },
    {
        title: "Write to Us",
        desc: "Send feedback or report an issue",
        href: "/support",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        )
    },
    {
        title: "Payment Methods",
        desc: "Add or remove your saved cards",
        href: "/payments",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        )
    },
    {
        title: "Address Book",
        desc: "Manage your delivery addresses",
        href: "/dashboard/address-book",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                <line x1="12" y1="10" x2="12" y2="16" />
                <line x1="8" y1="10" x2="8" y2="16" />
                <line x1="16" y1="10" x2="16" y2="16" />
            </svg>
        )
    }
];
export default Dashboard;   