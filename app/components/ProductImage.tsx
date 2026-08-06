"use client";

import { useEffect, useMemo, useState } from "react";

type ProductImageProps = {
  image: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
};

export default function ProductImage({
  image,
  name,
  className = "h-full w-full object-contain p-4",
  fallbackClassName = "h-full w-full",
}: ProductImageProps) {
  const candidates = useMemo(() => {
    const cleanImage = image.trim();
    const base = cleanImage.replace(/\.(jpeg|jpg|png|webp|jfif)$/i, "");

    return Array.from(
      new Set([
        cleanImage,
        `${base}.png`,
        `${base}.jpeg`,
        `${base}.jpg`,
        `${base}.webp`,
        `${base}.jfif`,
      ])
    );
  }, [image]);

  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
  setIndex(0);
  setFailed(false);
}, [image]);
  function tryNextImage() {
    if (index < candidates.length - 1) {
      setIndex((current) => current + 1);
    } else {
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 p-6 text-center ${fallbackClassName}`}
      >
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
      src={candidates[index]}
      alt={name}
      onError={tryNextImage}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}