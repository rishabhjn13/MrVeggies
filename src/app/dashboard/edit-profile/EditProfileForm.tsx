'use client';

import React, { useState } from 'react';
import styles from './EditProfile.module.css';
import Navbar from '@/app/components/Navbar';
import Toggle from '@/app/components/Toggle';
import FormField from './FormField';
import { useAuthStore } from '@/store/useAuthStore';
import { updateProfile, type ProfileUpdate } from '@/lib/updateProfile';
import { BIO_LIMIT, DEFAULT_AVATAR_URL, GENDER_OPTIONS } from '@/lib/constants/profile';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import PhotoUrlModal from './PhotoUrlModal';


/** Form state has exactly the shape of the update payload, with every field filled in. */
type ProfileFormValues = Required<ProfileUpdate>;
type TextFieldName = 'displayName' | 'email' | 'phoneNumber' | 'dateOfBirth' | 'city';

const EditProfileForm = () => {
    const user = useAuthStore((state) => state.user);
    const [formData, setFormData] = useState<ProfileFormValues>({
        displayName: user?.displayName ?? '',
        email: user?.email ?? '',
        phoneNumber: user?.phoneNumber ?? '',
        dateOfBirth: user?.dateOfBirth ?? '',
        gender: user?.gender ?? '',
        city: user?.city ?? '',
        bio: user?.bio ?? '',
        whatsappNotifications: user?.whatsappNotifications ?? false,
        photoURL: user?.photoURL ?? '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const uid = user?.uid ?? '';
    const avatarSrc = formData.photoURL || DEFAULT_AVATAR_URL; // display only, never saved

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /** Shared props for the plain text inputs. */
    const field = (name: TextFieldName) => ({
        name,
        value: formData[name],
        onChange: handleChange,
    });

    const toggleWhatsapp = () =>
        setFormData(prev => ({ ...prev, whatsappNotifications: !prev.whatsappNotifications }));

    const handleCopyUid = async () => {
        if (!uid) return;
        try {
            await navigator.clipboard.writeText(uid);
            setCopied(true);
            toast.success("UID copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy UID");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const result = await updateProfile(formData);

        if (result.success) {
            toast.success("Profile updated successfully!");
        } else {
            toast.error(`Failed to update profile: ${result.error}`);
        }

        setIsSaving(false);
    };

    const handlePhotoSave = async (url: string) => {
        const result = await updateProfile({ photoURL: url });
        if (result.success) {
            setFormData(prev => ({ ...prev, photoURL: url }));
            toast.success(url ? "Profile photo updated!" : "Profile photo removed.");
        }
        return result;
    };
    return (
        <>
            <Navbar />
            {showPhotoModal && (
                <PhotoUrlModal
                    currentUrl={formData.photoURL}
                    onSave={handlePhotoSave}
                    onClose={() => setShowPhotoModal(false)}
                />
            )}
            <Toaster position="top-right" />
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Edit Profile</h1>
                        <p>Manage your personal information and preferences</p>
                    </div>

                    <form onSubmit={handleSave} className={styles.form}>
                        {/* Avatar Section */}
                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                <Image src={avatarSrc} alt="Avatar" width={100} height={100} unoptimized />
                            </div>
                            <button
                                type="button"
                                className={styles.changePhotoBtn}
                                onClick={() => setShowPhotoModal(true)}
                            >
                                Change Photo
                            </button>
                        </div>

                        {/* UID (read-only) */}
                        <div className={styles.formGroup}>
                            <label>User ID</label>
                            <div className={styles.uidRow}>
                                <span className={styles.uidValue} title={uid}>
                                    {uid || "—"}
                                </span>
                                <button
                                    type="button"
                                    className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
                                    onClick={handleCopyUid}
                                    disabled={!uid}
                                >
                                    {copied ? "✓ Copied" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <FormField label="Full Name" type="text" required placeholder="Enter your full name" {...field('displayName')} />
                        <FormField label="Email Address" type="email" required placeholder="your@email.com" {...field('email')} />
                        <FormField label="Phone Number" type="tel" placeholder="+91 98765 43210" {...field('phoneNumber')} />
                        <FormField label="Date of Birth" type="date" {...field('dateOfBirth')} />

                        <div className={styles.formGroup}>
                            <label htmlFor="gender">Gender</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                                {GENDER_OPTIONS.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <FormField label="City" type="text" placeholder="e.g. New Delhi" {...field('city')} />

                        <div className={styles.formGroup}>
                            <div className={styles.labelRow}>
                                <label htmlFor="bio">Bio</label>
                                <span className={styles.charCount}>
                                    {BIO_LIMIT - formData.bio.length} left
                                </span>
                            </div>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={3}
                                maxLength={BIO_LIMIT}
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us a little about yourself"
                            />
                        </div>

                        {/* WhatsApp notifications */}
                        <div className={styles.toggleRow}>
                            <div className={styles.toggleInfo}>
                                <span className={styles.toggleLabel}>WhatsApp notifications</span>
                                <span className={styles.toggleSub}>
                                    Get order updates and offers on your phone number
                                </span>
                            </div>
                            <Toggle
                                on={formData.whatsappNotifications}
                                onChange={toggleWhatsapp}
                                label="Subscribe to WhatsApp notifications"
                            />
                        </div>

                        <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                            {isSaving ? "Updating Profile..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditProfileForm;