"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../data/products";
import { useStore } from "../context/StoreContext";
import ProductImage from "./ProductImage";

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([product.image, ...(product.images ?? [])].filter(Boolean)));
  }, [product]);

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    setSelectedImage(galleryImages[0] ?? "");
  }, [galleryImages]);

  if (!product) return null;

  const favorite = isFavorite(product.id);
  const hasSale =
    Boolean(product.on_sale) &&
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    Number(product.sale_price) < product.price;

  const finalPrice = hasSale ? Number(product.sale_price) : product.price;
  const discount =
    hasSale && product.price > 0
      ? Math.round(((product.price - finalPrice) / product.price) * 100)
      : 0;

  const outOfStock = !product.available || (product.stock ?? 0) <= 0;
  const message = encodeURIComponent(
    `Hola, deseo información sobre ${product.name} (${product.code || product.id}) por $${finalPrice.toFixed(2)}.`
  );
  const whatsappUrl = `https://wa.me/593992656247?text=${message}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Cerrar detalle" onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <article className="relative z-10 grid max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#080808] shadow-2xl md:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden bg-white md:min-h-[620px]">
          {hasSale ? (
            <span className="absolute left-5 top-5 z-10 rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white">
              OFERTA -{discount}%
            </span>
          ) : (
            product.featured && (
              <span className="absolute left-5 top-5 z-10 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                Destacado
              </span>
            )
          )}

          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1">
              <ProductImage
                image={selectedImage || product.image}
                name={product.name}
                className="h-full w-full object-contain p-8"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto border-t border-gray-200 p-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 w-20 flex-none overflow-hidden rounded-xl border-2 bg-white ${
                      selectedImage === image ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <ProductImage
                      image={image}
                      name={`${product.name} - imagen ${index + 1}`}
                      className="h-full w-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col p-7 md:p-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">{product.category}</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">{product.name}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              Cerrar
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Código</span>
              <span className="font-bold">{product.code || "Sin código"}</span>
            </div>
          </div>

          <div className="mt-8">
            {hasSale ? (
              <>
                <p className="text-lg text-gray-500 line-through">${product.price.toFixed(2)}</p>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-4xl font-black text-red-500">${finalPrice.toFixed(2)}</p>
                  <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white">-{discount}%</span>
                </div>
              </>
            ) : (
              <p className="text-4xl font-black">${product.price.toFixed(2)}</p>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <h3 className="mb-2 text-lg font-bold">Descripción</h3>
              <p className="leading-7 text-gray-400">
                {product.description?.trim()
                  ? product.description
                  : "Producto disponible en Vortex Import EC. Atención personalizada y envíos mediante Servientrega a todo Ecuador."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Stock disponible</span>
                <span className="font-black text-blue-400">{product.stock ?? 0} unidades</span>
              </div>
            </div>
          </div>

          <div className="mt-auto grid gap-3 pt-8">
            <button
              type="button"
              onClick={() => addToCart(product)}
              disabled={outOfStock}
              className="rounded-full bg-blue-600 px-6 py-4 font-black disabled:bg-gray-700"
            >
              {outOfStock ? "Producto agotado" : "Agregar al carrito"}
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className={`rounded-full border px-6 py-4 font-black ${
                favorite ? "border-red-500 bg-red-500/10 text-red-400" : "border-white/15"
              }`}
            >
              {favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>

            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-6 py-4 text-center font-black">
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
