'use client';

import React from 'react';
import styles from './AddressBook.module.css';
import Navbar from '@/app/components/Navbar';
import AddressFormModal from '@/app/components/AddressformModal';
import AddressList from './AddressList';
import { useAddressBook } from './useAddressBook';
import { useHasMounted } from '@/hooks/useHasMounted';

const AddressBookContent = () => {
    const mounted = useHasMounted(); // the store rehydrates from localStorage on the client
    const book = useAddressBook();

    return (
        <>
            <Navbar />

            {/* The modal prefills from initialValues (edit) or starts clean (add) each time it opens */}
            <AddressFormModal
                isOpen={book.modalOpen}
                initialValues={book.editing}
                onClose={book.closeModal}
                onSave={book.save}
            />

            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Address Book</h1>
                        <button type="button" className={styles.addBtn} onClick={book.openAdd}>
                            + Add New Address
                        </button>
                    </div>

                    {mounted && (
                        <AddressList
                            addresses={book.addresses}
                            onEdit={book.openEdit}
                            onDelete={book.remove}
                            onMakeDefault={book.makeDefault}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default AddressBookContent;