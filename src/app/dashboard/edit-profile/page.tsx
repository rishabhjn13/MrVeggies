'use client';

import React, { useState } from 'react';
import styles from './EditProfile.module.css';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/store/useAuthStore';
import { updateProfile } from '@/services/lib/updateProfile';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

const EditProfile = () => {
    const user = useAuthStore((state) => state.user);
    const [formData, setFormData] = useState({
        name: user?.displayName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        dateOfBirth: user?.dateOfBirth || "",
        photoURL: user?.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const result = await updateProfile({
            displayName: formData.name,
            email: formData.email,
            phoneNumber: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            photoURL: formData.photoURL,
        });

        if (result.success) {
            toast.success("Profile updated successfully!");
        } else {
            toast.error(`Failed to update profile: ${result.error}`);
        }

        setIsSaving(false);
    };

    return (
        <>
            <Navbar />
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
                                {formData.photoURL ? (
                                    <Image src={formData.photoURL} alt="Avatar" width={100} height={100} />
                                ) : (
                                    <span>{formData.name?.charAt(0).toUpperCase() || "?"}</span>
                                )}
                            </div>
                            <button type="button" className={styles.changePhotoBtn}>
                                Change Photo
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={isSaving}
                        >
                            {isSaving ? "Updating Profile..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditProfile;