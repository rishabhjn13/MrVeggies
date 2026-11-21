'use client';

import React from 'react';
import styles from './AddressBook.module.css';
import AddressCard from './AddressCard';
import type { Address } from '@/types/address';

interface AddressListProps {
    addresses: Address[];
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    onMakeDefault: (id: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ addresses, onEdit, onDelete, onMakeDefault }) => {
    if (addresses.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                </svg>
                <p>No saved addresses yet. Use &ldquo;Add New Address&rdquo; to create one.</p>
            </div>
        );
    }

    return (
        <div className={styles.addressList}>
            {addresses.map((address) => (
                <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMakeDefault={onMakeDefault}
                />
            ))}
        </div>
    );
};

export default AddressList;