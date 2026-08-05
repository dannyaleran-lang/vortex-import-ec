"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../data/products";
import { products } from "../../data/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

const PRODUCTS_PER_PAGE = 12;

export default function Shop() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(products.map((product) => product.category))).sort(),
    ],
    []
  );

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;

      const matchesSearch =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.code.toLowerCase().includes(normalized);

      return matchesCategory && matchesSearch;
    });
  }, [query, category]);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [query, category]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <>
      <section id="categorias" className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
            Explora
          </p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">Categorías</h2>

          <div className="mt-8 flex gap-3 overflow-x-auto pb-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition ${
                  category === item
                    ? "bg-blue-600 text-white"
                    : "border border-white/15 text-gray-300 hover:border-blue-500 hover:text-blue-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="tienda" className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
                Catálogo Vortex
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                Nuestros productos
              </h2>
              <p className="mt-3 text-gray-400">
                Mostrando {visibleProducts.length} de {filteredProducts.length} productos.
              </p>
            </div>

            <div className="w-full md:max-w-md">
              <label htmlFor="search" className="sr-only">
                Buscar productos
              </label>
              <input
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full rounded-full border border-white/15 bg-white/[0.05] px-5 py-4 outline-none transition placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>
          </div>

          {visibleProducts.length > 0 ? (
            <>
              <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((current) => current + PRODUCTS_PER_PAGE)
                    }
                    className="rounded-full border border-white/15 px-8 py-4 font-black transition hover:border-blue-500 hover:text-blue-400"
                  >
                    Mostrar 12 productos más
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-gray-400">
              No encontramos productos con esa búsqueda.
            </div>
          )}
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
