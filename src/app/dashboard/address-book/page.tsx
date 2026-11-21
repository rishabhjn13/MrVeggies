// app/dashboard/address-book/page.tsx
import type { Metadata } from 'next';
import AddressBookContent from './AddressBookContent';

export const metadata: Metadata = {
    title: 'Address Book - MrVeggies',
    description: 'Manage your saved delivery addresses on MrVeggies',
};

export default function AddressBookPage() {
    return <AddressBookContent />;
}