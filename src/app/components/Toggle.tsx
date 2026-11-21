import styles from './Toggle.module.css';

interface ToggleProps {
    on: boolean;
    onChange: () => void;
    label: string; // accessible name
}

export default function Toggle({ on, onChange, label }: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
            onClick={onChange}
        >
            <span className={styles.toggleThumb} />
        </button>
    );
}