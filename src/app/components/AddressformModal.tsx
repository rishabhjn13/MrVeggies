'use client';

import React, { useState, useEffect } from 'react';
import styles from './AddressFormModal.module.css';

type AddressType = 'Home' | 'Work' | 'Other';

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
    onSave: (data: AddressFormData) => void;
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

const ADDRESS_TYPES: AddressType[] = ['Home', 'Work', 'Other'];

const TYPE_ICONS: Record<AddressType, string> = {
    Home: '🏠',
    Work: '💼',
    Other: '📍',
};

const AddressFormModal: React.FC<AddressFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [form, setForm] = useState<AddressFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
    const [saving, setSaving] = useState(false);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const set = <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
        if (!form.name.trim()) newErrors.name = 'Full name is required';
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\+?[\d\s\-]{8,15}$/.test(form.phone.trim()))
            newErrors.phone = 'Enter a valid phone number';
        if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!form.city.trim()) newErrors.city = 'City is required';
        if (!form.state.trim()) newErrors.state = 'State is required';
        if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(form.pincode.trim()))
            newErrors.pincode = 'Enter a valid 6-digit pincode';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        await new Promise(r => setTimeout(r, 600)); // simulate async
        onSave(form);
        setSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
            {/* Panel stops click propagation so clicking inside doesn't close */}
            <aside
                className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Panel Header ── */}
                <div className={styles.panelHeader}>
                    <div className={styles.panelTitleGroup}>
                        <span className={styles.panelEyebrow}>Address Book</span>
                        <h2 className={styles.panelTitle}>Add New Address</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className={styles.panelBody}>

                    {/* Address Type Selector */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Address Type</label>
                        <div className={styles.typeRow}>
                            {ADDRESS_TYPES.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`${styles.typeBtn} ${form.type === t ? styles.typeBtnActive : ''}`}
                                    onClick={() => set('type', t)}
                                >
                                    <span className={styles.typeIcon}>{TYPE_ICONS[t]}</span>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={styles.sectionLabel}>Contact Details</div>

                    {/* Full Name */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="addr-name">Full Name</label>
                        <input
                            id="addr-name"
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            type="text"
                            placeholder="e.g. Rishabh Jain"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                        />
                        {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
                    </div>

                    {/* Phone */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="addr-phone">Phone Number</label>
                        <div className={styles.inputWithPrefix}>
                            <span className={styles.inputPrefix}>📞</span>
                            <input
                                id="addr-phone"
                                className={`${styles.input} ${styles.inputPrefixed} ${errors.phone ? styles.inputError : ''}`}
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                            />
                        </div>
                        {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
                    </div>

                    {/* Divider */}
                    <div className={styles.sectionLabel}>Address Details</div>

                    {/* Address Line 1 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="addr-line1">Address Line 1 <span className={styles.required}>*</span></label>
                        <input
                            id="addr-line1"
                            className={`${styles.input} ${errors.addressLine1 ? styles.inputError : ''}`}
                            type="text"
                            placeholder="House no., Building, Street"
                            value={form.addressLine1}
                            onChange={e => set('addressLine1', e.target.value)}
                        />
                        {errors.addressLine1 && <span className={styles.errorMsg}>{errors.addressLine1}</span>}
                    </div>

                    {/* Address Line 2 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="addr-line2">Address Line 2 <span className={styles.optional}>(Optional)</span></label>
                        <input
                            id="addr-line2"
                            className={styles.input}
                            type="text"
                            placeholder="Area, Colony, Locality"
                            value={form.addressLine2}
                            onChange={e => set('addressLine2', e.target.value)}
                        />
                    </div>

                    {/* Landmark */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="addr-landmark">Landmark <span className={styles.optional}>(Optional)</span></label>
                        <input
                            id="addr-landmark"
                            className={styles.input}
                            type="text"
                            placeholder="Near Metro, Opposite Mall…"
                            value={form.landmark}
                            onChange={e => set('landmark', e.target.value)}
                        />
                    </div>

                    {/* City + State row */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="addr-city">City <span className={styles.required}>*</span></label>
                            <input
                                id="addr-city"
                                className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                                type="text"
                                placeholder="New Delhi"
                                value={form.city}
                                onChange={e => set('city', e.target.value)}
                            />
                            {errors.city && <span className={styles.errorMsg}>{errors.city}</span>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="addr-pincode">Pincode <span className={styles.required}>*</span></label>
                            <input
                                id="addr-pincode"
                                className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="110001"
                                value={form.pincode}
                                onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
                            />
                            {errors.pincode && <span className={styles.errorMsg}>{errors.pincode}</span>}
                        </div>
                    </div>

                    {/* State */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="addr-state">State <span className={styles.required}>*</span></label>
                        <select
                            id="addr-state"
                            className={`${styles.input} ${styles.select} ${errors.state ? styles.inputError : ''}`}
                            value={form.state}
                            onChange={e => set('state', e.target.value)}
                        >
                            <option value="">Select state…</option>
                            {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                                'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
                                'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                                'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
                                'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                                'Delhi', 'Jammu & Kashmir', 'Ladakh'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                        </select>
                        {errors.state && <span className={styles.errorMsg}>{errors.state}</span>}
                    </div>

                    {/* Default toggle */}
                    <label className={styles.defaultToggle}>
                        <div className={`${styles.toggle} ${form.isDefault ? styles.toggleOn : ''}`}
                            onClick={() => set('isDefault', !form.isDefault)}
                            role="switch"
                            aria-checked={form.isDefault}
                            tabIndex={0}
                            onKeyDown={e => e.key === ' ' && set('isDefault', !form.isDefault)}
                        >
                            <span className={styles.toggleThumb} />
                        </div>
                        <div className={styles.toggleLabel}>
                            <span className={styles.toggleTitle}>Set as default address</span>
                            <span className={styles.toggleSub}>Used automatically at checkout</span>
                        </div>
                    </label>
                </div>

                {/* ── Footer Actions ── */}
                <div className={styles.panelFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        className={`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ''}`}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <span className={styles.spinner} />
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 8l4.5 4.5L14 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Save Address
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default AddressFormModal;