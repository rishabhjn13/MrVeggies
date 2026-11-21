import React from 'react';
import styles from './EditProfile.module.css';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label: string;
}

export default function FormField({ name, label, ...inputProps }: FormFieldProps) {
    return (
        <div className={styles.formGroup}>
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} {...inputProps} />
        </div>
    );
}