"use client";

import type { Product } from "../../data/products";
import { useStore } from "../context/StoreContext";
import ProductImage from "./ProductImage";

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({
  product,
  onClose,
}: ProductModalProps) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  if (!product) return null;

  const favorite = isFavorite(product.id);
  const message = encodeURIComponent(
    `Hola, deseo información sobre ${product.name} (${product.code || product.id}) por $${product.price.toFixed(2)}.`
  );
  const whatsappUrl = `https://wa.me/593992656247?text=${message}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar detalle"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <article className="relative z-10 grid max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#080808] shadow-2xl md:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden bg-white md:min-h-[620px]">
          {product.featured && (
            <span className="absolute left-5 top-5 z-10 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white">
              Destacado
            </span>
          )}

          <ProductImage
            image={product.image}
            name={product.name}
            className="h-full w-full object-contain p-8"
          />
        </div>

        <div className="flex flex-col p-7 md:p-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                {product.category}
              </p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-blue-500"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Código</span>
              <span className="font-bold">
                {product.code || "Sin código"}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-gray-400">Disponibilidad</span>
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
          </div>

          <p className="mt-8 text-4xl font-black">
            ${product.price.toFixed(2)}
          </p>

          <p className="mt-5 leading-7 text-gray-400">
            Producto disponible en Vortex Import EC. Atención personalizada y
            envíos mediante Servientrega a todo Ecuador.
          </p>

          <div className="mt-auto grid gap-3 pt-8">
            <button
              type="button"
              onClick={() => addToCart(product)}
              disabled={!product.available}
              className="rounded-full bg-blue-600 px-6 py-4 font-black transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              Agregar al carrito
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className={`rounded-full border px-6 py-4 font-black transition ${
                favorite
                  ? "border-red-500 bg-red-500/10 text-red-400"
                  : "border-white/15 hover:border-blue-500 hover:text-blue-400"
              }`}
            >
              {favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 px-6 py-4 text-center font-black transition hover:border-blue-500 hover:text-blue-400"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
