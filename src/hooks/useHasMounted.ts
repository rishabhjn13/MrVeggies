import { useEffect, useState } from 'react';

/**
 * True only after the first client render. Use it to avoid hydration
 * mismatches / empty-state flashes when reading persisted stores
 * (cart, address book) that rehydrate from localStorage.
 */
export function useHasMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}