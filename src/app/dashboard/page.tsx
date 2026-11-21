import type { Metadata } from 'next';
import DashboardContent from './DashboardContent';

export const metadata: Metadata = {
    title: 'Dashboard - MrVeggies',
    description: 'Manage your MrVeggies account, orders, addresses and payments',
};

export default function DashboardPage() {
    return <DashboardContent />;
}