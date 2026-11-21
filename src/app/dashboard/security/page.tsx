import type { Metadata } from 'next';
import SecurityContent from './SecurityContent';

export const metadata: Metadata = {
    title: 'Security & 2FA - MrVeggies',
    description: 'Manage your password, two-factor authentication and active sessions',
};

export default function SecurityPage() {
    return <SecurityContent />;
}