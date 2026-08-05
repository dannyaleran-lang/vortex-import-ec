"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../../data/products";

export type CartItem = Product & {
  quantity: number;
};

type StoreContextType = {
  cart: CartItem[];
  favorites: string[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  cartCount: number;
  total: number;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("vortex-cart");
      const savedFavorites = localStorage.getItem("vortex-favorites");

      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch {
      // Si el navegador tiene datos dañados, iniciamos la tienda vacía.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("vortex-cart", JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem("vortex-favorites", JSON.stringify(favorites));
  }, [favorites, ready]);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setCartOpen(true);
  }

  function removeFromCart(productId: string) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  function increaseQuantity(productId: string) {
    setCart((current) =>
      current.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(productId: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleFavorite(productId: string) {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }

  const value = useMemo(
    () => ({
      cart,
      favorites,
      cartOpen,
      setCartOpen,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      toggleFavorite,
      isFavorite: (productId: string) => favorites.includes(productId),
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    [cart, favorites, cartOpen]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore debe utilizarse dentro de StoreProvider");
  }

  return context;
}
