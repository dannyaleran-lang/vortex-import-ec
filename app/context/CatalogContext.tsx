"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as baseProducts, type Product } from "../../data/products";

type ProductOverride = Partial<
  Pick<Product, "price" | "available" | "featured" | "name" | "category">
>;

type CatalogContextType = {
  products: Product[];
  updateProduct: (productId: string, changes: ProductOverride) => void;
  resetProduct: (productId: string) => void;
  resetCatalog: () => void;
};

const CatalogContext = createContext<CatalogContextType | null>(null);

const STORAGE_KEY = "vortex-product-overrides";

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOverrides(JSON.parse(saved));
    } catch {
      setOverrides({});
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    }
  }, [overrides, ready]);

  const products = useMemo(
    () =>
      baseProducts.map((product) => ({
        ...product,
        ...(overrides[product.id] ?? {}),
      })),
    [overrides]
  );

  function updateProduct(productId: string, changes: ProductOverride) {
    setOverrides((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] ?? {}),
        ...changes,
      },
    }));
  }

  function resetProduct(productId: string) {
    setOverrides((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  function resetCatalog() {
    setOverrides({});
  }

  return (
    <CatalogContext.Provider
      value={{ products, updateProduct, resetProduct, resetCatalog }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog debe utilizarse dentro de CatalogProvider");
  }
  return context;
}
