// src/components/CartInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase/firebase';

export default function CartInitializer({ children }: { children: React.ReactNode }) {
    const initializeCart = useCartStore((state) => state.initializeCart);

    useEffect(() => {
        // Firebase auth state track karega ki user logged-in hai ya nahi
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.uid) {
                // Agar user logged-in hai, toh uski UID se uska specific cart fetch karo
                await initializeCart(user.uid);
            } else {
                // Agar user logged-out hai, toh cart clear kar do
                await initializeCart(null);
            }
        });

        return () => unsubscribe();
    }, [initializeCart]);

    return <>{children}</>;
}