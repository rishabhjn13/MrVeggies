'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '@/types/database';

interface CartContextType {
  isCartOpen: boolean;
  cartItems: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);


export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(prev => !prev);

    const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === newItem.id);

            if (existing) {
                return prev.map(item =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, { ...newItem, quantity: 1 }];
            }
        });
        // Optionally auto-open cart when adding item
        // setIsCartOpen(true);
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;

        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
        closeCart();
    };

    const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const getSubtotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const value: CartContextType = {
        isCartOpen,
        cartItems,
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