"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Artwork } from '@/types/artwork.types';

interface CartContextType {
  items: CartItem[];
  addItem: (artwork: Artwork, quantity?: number) => void;
  removeItem: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCount: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gk_cart');
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('gk_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Error saving cart to localStorage', e);
      }
    }
  }, [items, isInitialized]);

  const addItem = useCallback((artwork: Artwork, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.artwork.id === artwork.id);
      if (existing) {
        return prev.map((item) =>
          item.artwork.id === artwork.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, artwork.stock) } // Enforce stock limit
            : item
        );
      }
      return [...prev, { artwork, quantity: Math.min(quantity, artwork.stock) }];
    });
  }, []);

  const removeItem = useCallback((artworkId: string) => {
    setItems((prev) => prev.filter((item) => item.artwork.id !== artworkId));
  }, []);

  const updateQuantity = useCallback((artworkId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.artwork.id === artworkId) {
          const validQuantity = Math.max(1, Math.min(quantity, item.artwork.stock));
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.artwork.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalCount,
        isInitialized,
      }}
    >
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
