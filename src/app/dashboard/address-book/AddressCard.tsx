'use client';

import React, { useState } from 'react';
import styles from './AddressBook.module.css';
import { formatAddressLines } from '@/lib/address';
import type { Address } from '@/types/address';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    onMakeDefault: (id: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onMakeDefault }) => {
    const [confirming, setConfirming] = useState(false);
    const lines = formatAddressLines(address);

    return (
        <div className={styles.addressCard}>
            <div className={styles.addressHeader}>
                <span className={styles.addressType}>{address.type}</span>
                {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
            </div>

            <h3>{address.name}</h3>
            <p className={styles.phone}>{address.phone}</p>
            <p className={styles.fullAddress}>
                {lines.map((line, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <br />}
                        {line}
                    </React.Fragment>
                ))}
                {address.landmark && <><br />Near: {address.landmark}</>}
            </p>

            {confirming ? (
                <div className={styles.confirmRow} role="alert">
                    <span className={styles.confirmText}>Delete this address?</span>
                    <button type="button" className={styles.deleteBtn} onClick={() => onDelete(address.id)}>
                        Yes, delete
                    </button>
                    <button type="button" className={styles.editBtn} onClick={() => setConfirming(false)}>
                        Cancel
                    </button>
                </div>
            ) : (
                <div className={styles.actions}>
                    <button type="button" className={styles.editBtn} onClick={() => onEdit(address)}>
                        Edit
                    </button>
                    <button type="button" className={styles.deleteBtn} onClick={() => setConfirming(true)}>
                        Delete
                    </button>
                    {!address.isDefault && (
                        <button type="button" className={styles.makeDefaultBtn} onClick={() => onMakeDefault(address.id)}>
                            Make default
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressCard;