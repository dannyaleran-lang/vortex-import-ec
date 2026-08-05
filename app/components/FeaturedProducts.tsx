"use client";

import { useState } from "react";
import type { Product } from "../../data/products";
import { products } from "../../data/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function FeaturedProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);

  if (!featuredProducts.length) return null;

  return (
    <>
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
                Selección Vortex
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                Productos destacados
              </h2>
              <p className="mt-4 max-w-2xl text-gray-400">
                Una selección de productos recomendados para cocina y hogar.
              </p>
            </div>

            <a
              href="#tienda"
              className="rounded-full border border-white/15 px-6 py-3 text-center font-bold transition hover:border-blue-500 hover:text-blue-400"
            >
              Ver catálogo completo
            </a>
          </div>

          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
