// app/dashboard/payments/page.tsx
import type { Metadata } from 'next';
import PaymentConfigContent from './PaymentConfigContent';

export const metadata: Metadata = {
    title: 'Payment Methods - MrVeggies',
    description: 'Add or remove your saved cards and manage payment preferences on MrVeggies',
};

export default function PaymentsPage() {
    return <PaymentConfigContent />;
}