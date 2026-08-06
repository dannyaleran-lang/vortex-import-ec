"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "../../data/products";
import { products as backupProducts } from "../../data/products";
import { supabase } from "../../lib/supabase";

type ProductOverride = Partial<
  Pick<
    Product,
    | "price"
    | "available"
    | "featured"
    | "name"
    | "category"
    | "description"
    | "stock"
    | "sale_price"
    | "on_sale"
  >
>;

type CatalogContextType = {
  products: Product[];
  loading: boolean;
  error: string | null;
  updateProduct: (
    productId: string,
    changes: ProductOverride
  ) => void;
  resetProduct: (productId: string) => void;
  resetCatalog: () => void;
  reloadProducts: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextType | null>(null);

const OVERRIDES_KEY = "vortex-product-overrides";

export function CatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [databaseProducts, setDatabaseProducts] =
    useState<Product[]>(backupProducts);

  const [overrides, setOverrides] = useState<
    Record<string, ProductOverride>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(OVERRIDES_KEY);

      if (saved) {
        setOverrides(JSON.parse(saved));
      }
    } catch {
      setOverrides({});
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(
        OVERRIDES_KEY,
        JSON.stringify(overrides)
      );
    }
  }, [overrides, ready]);

  async function reloadProducts() {
    setLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from("products")
      .select(`
  id,
  name,
  code,
  price,
  category,
  image,
  available,
  featured,
  description,
  stock,
  sale_price,
on_sale,
  product_images (
    image_url,
    position
  )
`)
      .order("id", { ascending: true });

    if (supabaseError) {
      console.error(
        "Error Supabase:",
        JSON.stringify(supabaseError, null, 2)
      );

      setError(
        "No se pudo conectar con la base de datos. Se está usando el catálogo de respaldo."
      );

      setDatabaseProducts(backupProducts);
      setLoading(false);
      return;
    }

    const formattedProducts: Product[] = (data ?? []).map(
  (product) => ({
    id: String(product.id),

    name: String(product.name),

    code: product.code
      ? String(product.code)
      : "",

    price: Number(product.price),

    category: String(product.category),

    image: String(product.image).startsWith("http")
      ? String(product.image)
      : product.code
        ? `/products/${String(product.code).trim()}.png`
        : String(product.image),

    available: Boolean(product.available),

    featured: Boolean(product.featured),

    description: product.description
      ? String(product.description)
      : "",

    stock: Number(product.stock ?? 0),

    sale_price:
  product.sale_price !== null && product.sale_price !== undefined
    ? Number(product.sale_price)
    : null,

on_sale: Boolean(product.on_sale),

    images: Array.isArray(product.product_images)
      ? product.product_images
          .sort(
            (
              a: { position: number },
              b: { position: number }
            ) => a.position - b.position
          )
          .map(
            (item: { image_url: string }) =>
              String(item.image_url)
          )
      : [],
  })
);

    if (formattedProducts.length === 0) {
      setError(
        "La tabla de Supabase está vacía. Se está usando el catálogo de respaldo."
      );

      setDatabaseProducts(backupProducts);
    } else {
      setDatabaseProducts(formattedProducts);
    }

    setLoading(false);
  }

  useEffect(() => {
    void reloadProducts();
  }, []);

  const products = useMemo(
    () =>
      databaseProducts.map((product) => ({
        ...product,
        ...(overrides[product.id] ?? {}),
      })),
    [databaseProducts, overrides]
  );

  function updateProduct(
    productId: string,
    changes: ProductOverride
  ) {
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
    localStorage.removeItem(OVERRIDES_KEY);
  }

  return (
    <CatalogContext.Provider
      value={{
        products,
        loading,
        error,
        updateProduct,
        resetProduct,
        resetCatalog,
        reloadProducts,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error(
      "useCatalog debe utilizarse dentro de CatalogProvider"
    );
  }

  return context;
}
