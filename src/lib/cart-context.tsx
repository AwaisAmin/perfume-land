"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { restoreCart, safeQuantity } from "@/lib/cart-validation";

export type CartItem = {
  handle: string;
  title: string;
  price: number;
  image?: string;
  size?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (handle: string) => void;
  updateQuantity: (handle: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cart";

/**
 * App-wide cart state (items, open/closed drawer) — no real backend, so
 * "adding to cart" just updates this in-memory list, persisted to
 * localStorage so it survives a reload. Swapping in a real cart API later
 * only changes the bodies of these functions, not who calls them.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Guards the save effect below from firing with the initial empty array
  // before the load effect has had a chance to hydrate `items` — without
  // this, both effects run on mount and the save effect's stale closure
  // overwrites whatever was just read from storage with `[]`.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so it can't be read in a lazy
    // useState initializer without a hydration mismatch — this is the
    // "synchronize with an external system" case the lint rule's own
    // message carves out, not the anti-pattern it otherwise flags.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored && stored.length <= 100000) setItems(restoreCart(JSON.parse(stored)));
    } catch {
      // ignore — private browsing, corrupted value, etc.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const addItem = (product: Product, quantity: number) => {
    quantity = safeQuantity(quantity);
    if (!quantity || product.inStock === false) return;
    setItems((current) => {
      const existing = current.find((item) => item.handle === product.handle);
      if (existing) {
        return current.map((item) =>
          item.handle === product.handle ? { ...item, quantity: safeQuantity(item.quantity + quantity) } : item,
        );
      }
      return [
        ...current,
        {
          handle: product.handle,
          title: product.title,
          price: product.price,
          image: product.image,
          size: product.size,
          quantity,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (handle: string) => {
    setItems((current) => current.filter((item) => item.handle !== handle));
  };

  const updateQuantity = (handle: string, quantity: number) => {
    quantity = safeQuantity(quantity);
    if (quantity < 1) {
      removeItem(handle);
      return;
    }
    setItems((current) => current.map((item) => (item.handle === handle ? { ...item, quantity } : item)));
  };

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
