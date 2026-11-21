// app/dashboard/support/page.tsx
import type { Metadata } from 'next';
import SupportContent from './SupportContent';

export const metadata: Metadata = {
    title: 'Write to Us - MrVeggies',
    description: 'Send feedback or report an issue to the MrVeggies support team',
};

export default function SupportPage() {
    return <SupportContent />;
}