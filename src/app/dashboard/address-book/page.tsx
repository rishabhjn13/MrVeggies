'use client';

import React, { useState } from 'react';
import styles from './AddressBook.module.css';
import Navbar from '@/app/components/Navbar';
import AddressFormModal from '@/app/components/AddressformModal';
interface Address {
    id: string;
    type: 'Home' | 'Work' | 'Other';
    name: string;
    phone: string;
    address: string;
    landmark?: string;
    isDefault: boolean;
}

const AddressBook = () => {
    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: '1',
            type: 'Home',
            name: 'Rishabh Jain',
            phone: '+91 98765 43210',
            address: '123, Green Park Colony, Near Metro Station',
            landmark: 'Opposite Reliance Fresh',
            isDefault: true,
        },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <>
            <Navbar />
            <AddressFormModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSave={() => { }} />
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Address Book</h1>
                        <button
                            className={styles.addBtn}
                            onClick={() => setShowAddForm(true)}
                        >
                            + Add New Address
                        </button>
                    </div>

                    <div className={styles.addressList}>
                        {addresses.map(addr => (
                            <div key={addr.id} className={styles.addressCard}>
                                <div className={styles.addressHeader}>
                                    <span className={styles.addressType}>{addr.type}</span>
                                    {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                                </div>

                                <h3>{addr.name}</h3>
                                <p className={styles.phone}>{addr.phone}</p>
                                <p className={styles.fullAddress}>
                                    {addr.address}
                                    {addr.landmark && <><br />Near: {addr.landmark}</>}
                                </p>

                                <div className={styles.actions}>
                                    <button className={styles.editBtn}>Edit</button>
                                    <button className={styles.deleteBtn}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddressBook;