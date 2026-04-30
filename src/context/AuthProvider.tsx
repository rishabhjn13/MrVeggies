"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { User } from "@/store/useAuthStore";
import { initializeAuth, useAuthStore } from "@/store/useAuthStore";
import LoadingSpinner from "@/app/components/LoadingSpinner";

type AuthContextType = {
    user: User | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    
    useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        loading,
    };


    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="flex h-screen w-full items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}
        </AuthContext.Provider>
    );
}