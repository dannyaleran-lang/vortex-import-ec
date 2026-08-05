"use client";

import type { Product } from "../../data/products";
import { useStore } from "../context/StoreContext";
import ProductImage from "./ProductImage";

type ProductCardProps = {
  product: Product;
  onViewDetails: (product: Product) => void;
};

export default function ProductCard({
  product,
  onViewDetails,
}: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const favorite = isFavorite(product.id);

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-blue-500/50">
      <div className="relative aspect-square overflow-hidden bg-white">
        {product.featured && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
            Destacado
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label="Agregar a favoritos"
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${
            favorite
              ? "border-red-500 bg-red-500 text-white"
              : "border-black/10 bg-white text-black hover:text-red-500"
          }`}
        >
          {favorite ? "♥" : "♡"}
        </button>

        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="h-full w-full"
          aria-label={`Ver detalles de ${product.name}`}
        >
          <ProductImage
            image={product.image}
            name={product.name}
            className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
          />
        </button>
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          {product.category}
        </p>

        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="mt-2 min-h-14 text-left text-xl font-black transition hover:text-blue-400"
        >
          {product.name}
        </button>

        <p className="mt-2 text-sm text-gray-400">
          Código: {product.code || "Sin código"}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-3xl font-black">${product.price.toFixed(2)}</p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              product.available
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {product.available ? "Disponible" : "Agotado"}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={!product.available}
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-700"
          >
            Agregar al carrito
          </button>

          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold transition hover:border-blue-500 hover:text-blue-400"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </article>
  );
}
