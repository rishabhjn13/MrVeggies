// app/dashboard/orders/page.tsx
import type { Metadata } from 'next';
import TrackOrdersContent from './TrackOrdersContent';

export const metadata: Metadata = {
    title: 'Track Orders - MrVeggies',
    description: 'View status, tracking info and history for all your MrVeggies orders',
};

export default function OrdersPage() {
    return <TrackOrdersContent />;
}