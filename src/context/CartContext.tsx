'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '@/types/database';
import { useCartStore } from '@/store/useCartStore';

interface CartContextType {
    isCartOpen: boolean;
    cartItems: CartItem[];
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addToCart: (item: any) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Zustand store se data sync ho raha hai
    const items = useCartStore((state) => state.items);
    const addItemStore = useCartStore((state) => state.addItem);
    const removeItemStore = useCartStore((state) => state.removeItem);
    const updateQuantityStore = useCartStore((state) => state.updateQuantity);
    const clearCartStore = useCartStore((state) => state.clearCart);
    const totalStore = useCartStore((state) => state.total);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(prev => !prev);

    const addToCart = (newItem: any) => {
        addItemStore({
            product_id: newItem.id || newItem.product_id,
            product_name: newItem.name || newItem.product_name,
            discounted_price: newItem.price || newItem.discounted_price,
            actual_price: newItem.actual_price || newItem.price,
            img_link: newItem.img_link || '',
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        updateQuantityStore(productId, quantity);
    };

    const removeFromCart = (productId: string) => {
        removeItemStore(productId);
    };

    const clearCart = () => {
        clearCartStore();
        closeCart();
    };

    const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);
    const getSubtotal = () => totalStore();

    const value: CartContextType = {
        isCartOpen,
        cartItems: items,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getSubtotal,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};