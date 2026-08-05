"use client";

import { useState } from "react";
import type { Product } from "../../data/products";

function ProductImage({
  image,
  name,
}: {
  image: string;
  name: string;
}) {
  const imageWithoutExtension = image.replace(/\.(jpeg|jpg|png|webp)$/i, "");

  const possibleImages = [
    `${imageWithoutExtension}.jpeg`,
    `${imageWithoutExtension}.jpg`,
    `${imageWithoutExtension}.png`,
    `${imageWithoutExtension}.webp`,
  ];

  const [imageIndex, setImageIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  function tryNextImage() {
    if (imageIndex < possibleImages.length - 1) {
      setImageIndex((current) => current + 1);
    } else {
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 p-6 text-center">
        <span className="text-5xl">📦</span>

        <p className="mt-4 text-sm font-bold text-gray-700">
          Imagen pendiente
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {name}
        </p>
      </div>
    );
  }

  return (
    <img
      src={possibleImages[imageIndex]}
      alt={name}
      onError={tryNextImage}
      className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
      loading="lazy"
    />
  );
}

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const message = encodeURIComponent(
    `Hola, deseo comprar ${product.name} (${product.code || product.id}) por $${product.price.toFixed(2)}.`
  );

  const whatsappUrl = `https://wa.me/593992656247?text=${message}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-blue-500/50">
      <div className="relative aspect-square overflow-hidden bg-white">
        {product.featured && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
            Destacado
          </span>
        )}

        <ProductImage
          image={product.image}
          name={product.name}
        />
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          {product.category}
        </p>

        <h3 className="mt-2 min-h-14 text-xl font-black">
          {product.name}
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          Código: {product.code || "Sin código"}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-3xl font-black">
            ${product.price.toFixed(2)}
          </p>

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

        <a
          href={product.available ? whatsappUrl : undefined}
          target="_blank"
          rel="noreferrer"
          className={`mt-5 block rounded-full px-5 py-3 text-center text-sm font-bold transition ${
            product.available
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "pointer-events-none bg-gray-700 text-gray-400"
          }`}
        >
          Comprar por WhatsApp
        </a>
      </div>
    </article>
  );
}