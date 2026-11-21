'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './AddressFormModal.module.css';
import type { Address, AddressInput, AddressType } from '@/types/address';

interface AddressFormData {
    type: AddressType;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AddressInput) => void;
    /** When set, the form is prefilled and the modal acts as "Edit address" */
    initialValues?: Address | null;
}

const EMPTY_FORM: AddressFormData = {
    type: 'Home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
};

const toFormData = (a: Address): AddressFormData => ({
    type: a.type,
    name: a.name,
    phone: a.phone,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? '',
    landmark: a.landmark ?? '',
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    isDefault: a.isDefault,
});

const ADDRESS_TYPES: AddressType[] = ['Home', 'Work', 'Other'];

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

type Errors = Partial<Record<keyof AddressFormData, string>>;

/** Label + control + error. Defined outside the modal so inputs keep focus while typing. */
const Field = ({ id, label, optional, error, children }: {
    id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode;
}) => (
    <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={id}>
            {label}
            {optional && <span className={styles.optional}> (optional)</span>}
        </label>
        {children}
        {error && <span id={`${id}-error`} className={styles.errorMsg} role="alert">{error}</span>}
    </div>
);

/** Accessibility attributes linking an input to its error message */
const a11y = (id: string, error?: string) => ({
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
});

const AddressFormModal: React.FC<AddressFormModalProps> = ({ isOpen, onClose, onSave, initialValues }) => {
    const isEditing = !!initialValues;
    const [form, setForm] = useState<AddressFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Errors>({});
    const [saving, setSaving] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    // Prefill for edit, or start clean for add, every time the modal opens
    useEffect(() => {
        if (!isOpen) return;
        setForm(initialValues ? toFormData(initialValues) : EMPTY_FORM);
        setErrors({});
        setSaving(false);
        nameRef.current?.focus();
    }, [isOpen, initialValues]);

    // While open: close on Escape and lock page scroll
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen, onClose]);

    const set = <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const next: Errors = {};
        if (!form.name.trim()) next.name = 'Full name is required';
        if (!form.phone.trim()) next.phone = 'Phone number is required';
        else if (!/^\+?[\d\s\-]{8,15}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number';
        if (!form.addressLine1.trim()) next.addressLine1 = 'Address is required';
        if (!form.city.trim()) next.city = 'City is required';
        if (!form.state.trim()) next.state = 'State is required';
        if (!form.pincode.trim()) next.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = 'Enter a valid 6-digit pincode';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        await new Promise(r => setTimeout(r, 600)); // simulate async
        onSave({
            type: form.type,
            name: form.name.trim(),
            phone: form.phone.trim(),
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim() || undefined,
            landmark: form.landmark.trim() || undefined,
            city: form.city.trim(),
            state: form.state,
            pincode: form.pincode.trim(),
            isDefault: form.isDefault,
        });
        setSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    const title = isEditing ? 'Edit address' : 'Add address';

    return (
        <div className={styles.overlay} onClick={onClose}>
            {/* Panel stops click propagation so clicking inside doesn't close */}
            <aside
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="addr-modal-title"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={styles.panelHeader}>
                    <div className={styles.panelTitleGroup}>
                        <h2 className={styles.panelTitle} id="addr-modal-title">{title}</h2>
                        <p className={styles.panelSub}>
                            {isEditing ? 'Update the details for this address.' : 'Enter the delivery details for this address.'}
                        </p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close" type="button">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className={styles.panelBody}>

                    <div className={styles.fieldGroup}>
                        <span className={styles.label} id="addr-type-label">Address type</span>
                        <div className={styles.segmented} role="radiogroup" aria-labelledby="addr-type-label">
                            {ADDRESS_TYPES.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    role="radio"
                                    aria-checked={form.type === t}
                                    className={`${styles.segment} ${form.type === t ? styles.segmentActive : ''}`}
                                    onClick={() => set('type', t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Contact details</h3>

                    <Field id="addr-name" label="Full name" error={errors.name}>
                        <input {...a11y('addr-name', errors.name)} ref={nameRef}
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            type="text" autoComplete="name" placeholder="As it should appear on the delivery"
                            value={form.name} onChange={e => set('name', e.target.value)} />
                    </Field>

                    <Field id="addr-phone" label="Phone number" error={errors.phone}>
                        <input {...a11y('addr-phone', errors.phone)}
                            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                            type="tel" autoComplete="tel" placeholder="+91 98765 43210"
                            value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </Field>

                    <h3 className={styles.sectionTitle}>Address details</h3>

                    <Field id="addr-line1" label="Address line 1" error={errors.addressLine1}>
                        <input {...a11y('addr-line1', errors.addressLine1)}
                            className={`${styles.input} ${errors.addressLine1 ? styles.inputError : ''}`}
                            type="text" autoComplete="address-line1" placeholder="House no., building, street"
                            value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)} />
                    </Field>

                    <Field id="addr-line2" label="Address line 2" optional>
                        <input id="addr-line2" className={styles.input}
                            type="text" autoComplete="address-line2" placeholder="Area, colony, locality"
                            value={form.addressLine2} onChange={e => set('addressLine2', e.target.value)} />
                    </Field>

                    <Field id="addr-landmark" label="Landmark" optional>
                        <input id="addr-landmark" className={styles.input}
                            type="text" placeholder="Nearby place that helps the delivery partner"
                            value={form.landmark} onChange={e => set('landmark', e.target.value)} />
                    </Field>

                    <div className={styles.row}>
                        <Field id="addr-city" label="City" error={errors.city}>
                            <input {...a11y('addr-city', errors.city)}
                                className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                                type="text" autoComplete="address-level2"
                                value={form.city} onChange={e => set('city', e.target.value)} />
                        </Field>

                        <Field id="addr-pincode" label="Pincode" error={errors.pincode}>
                            <input {...a11y('addr-pincode', errors.pincode)}
                                className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
                                type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6}
                                value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))} />
                        </Field>
                    </div>

                    <Field id="addr-state" label="State" error={errors.state}>
                        <select {...a11y('addr-state', errors.state)}
                            className={`${styles.input} ${styles.select} ${errors.state ? styles.inputError : ''}`}
                            autoComplete="address-level1"
                            value={form.state} onChange={e => set('state', e.target.value)}>
                            <option value="">Select state</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>

                    <label className={styles.checkRow}>
                        <input type="checkbox" className={styles.checkbox}
                            checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)} />
                        <span className={styles.checkText}>
                            <span className={styles.checkTitle}>Set as default address</span>
                            <span className={styles.checkSub}>Used automatically at checkout</span>
                        </span>
                    </label>
                </div>

                {/* Footer */}
                <div className={styles.panelFooter}>
                    <button className={styles.cancelBtn} onClick={onClose} type="button">Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving} type="button">
                        {saving ? <span className={styles.spinner} aria-label="Saving" /> : (isEditing ? 'Save changes' : 'Save address')}
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default AddressFormModal;