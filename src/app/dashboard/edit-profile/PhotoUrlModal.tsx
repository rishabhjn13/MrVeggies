'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './PhotoUrlModal.module.css';

interface PhotoUrlModalProps {
    currentUrl: string;
    /** Called with the new link, or with '' to clear the photo. */
    onSave: (url: string) => Promise<{ success: boolean; error?: string }>;
    onClose: () => void;
}

/** Returns an error message, or '' when the value is empty or acceptable. */
const getUrlError = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
        const url = new URL(trimmed);
        if (url.protocol !== 'https:') return 'The link must start with https://';
    } catch {
        return 'Enter a valid link, e.g. https://example.com/photo.jpg';
    }
    return '';
};

const PhotoUrlModal = ({ currentUrl, onSave, onClose }: PhotoUrlModalProps) => {
    const [url, setUrl] = useState(currentUrl);
    const [loadedUrl, setLoadedUrl] = useState('');  // last URL whose preview loaded
    const [failedUrl, setFailedUrl] = useState('');  // last URL whose preview failed
    const [pending, setPending] = useState<'save' | 'remove' | null>(null);
    const [saveError, setSaveError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const isBusy = pending !== null;
    const hasPhoto = Boolean(currentUrl.trim());
    const trimmed = url.trim();
    const urlError = getUrlError(url);
    const canPreview = Boolean(trimmed) && !urlError;
    const previewStatus = !canPreview
        ? 'empty'
        : loadedUrl === trimmed
            ? 'ok'
            : failedUrl === trimmed
                ? 'broken'
                : 'loading';

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isBusy) onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isBusy, onClose]);

    const submit = async (action: 'save' | 'remove', value: string) => {
        setPending(action);
        setSaveError('');
        try {
            const result = await onSave(value);
            if (result.success) {
                onClose();
                return;
            }
            setSaveError(result.error ?? 'Could not update the photo.');
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Could not update the photo.');
        }
        setPending(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (previewStatus !== 'ok' || isBusy) return;
        submit('save', trimmed);
    };

    const handleRemove = () => {
        if (isBusy) return;
        submit('remove', '');
    };

    const message =
        urlError ||
        (previewStatus === 'broken' ? "We couldn't load an image from this link." : '') ||
        saveError;

    return (
        <div
            className={styles.overlay}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isBusy) onClose();
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="photo-modal-title"
            >
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                    disabled={isBusy}
                    aria-label="Close"
                >
                    ✕
                </button>

                <h2 id="photo-modal-title" className={styles.title}>Change Photo</h2>
                <p className={styles.subtitle}>Paste a link to an image to use as your profile photo.</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.preview}>
                        {canPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={trimmed}
                                src={trimmed}
                                alt="Preview"
                                onLoad={() => setLoadedUrl(trimmed)}
                                onError={() => setFailedUrl(trimmed)}
                                className={previewStatus === 'ok' ? styles.previewImg : styles.previewHidden}
                            />
                        ) : null}
                        {previewStatus !== 'ok' && (
                            <span className={styles.previewPlaceholder}>
                                {previewStatus === 'loading' ? 'Loading…' : previewStatus === 'broken' ? '⚠️' : '🖼️'}
                            </span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="photoUrl">Image link</label>
                        <input
                            ref={inputRef}
                            id="photoUrl"
                            type="url"
                            inputMode="url"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); setSaveError(''); }}
                            placeholder="https://example.com/photo.jpg"
                            disabled={isBusy}
                            aria-invalid={Boolean(message)}
                            aria-describedby={message ? 'photoUrl-error' : undefined}
                        />
                        {message && (
                            <p className={styles.error} id="photoUrl-error" role="alert">{message}</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isBusy}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveBtn} disabled={previewStatus !== 'ok' || isBusy}>
                            {pending === 'save' ? 'Saving...' : 'Save Photo'}
                        </button>
                    </div>

                    {hasPhoto && (
                        <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={handleRemove}
                            disabled={isBusy}
                        >
                            {pending === 'remove' ? 'Removing...' : 'Remove current photo'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PhotoUrlModal;