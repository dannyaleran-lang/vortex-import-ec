"use client";

import { products } from "../../data/products";
import ProductImage from "./ProductImage";

export default function Hero() {
  const featured = products.find((product) => product.featured) ?? products[0];

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-bold text-blue-300">
            Envíos mediante Servientrega a todo Ecuador
          </p>

          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
            Innovación que llega a tu hogar.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400 md:text-xl">
            Cocina, electrodomésticos y productos para el hogar seleccionados
            para hacer tu vida más práctica.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#tienda"
              className="rounded-full bg-blue-600 px-8 py-4 text-center text-lg font-black transition hover:bg-blue-500"
            >
              Comprar ahora
            </a>

            <a
              href="#categorias"
              className="rounded-full border border-white/20 px-8 py-4 text-center text-lg font-black transition hover:border-blue-500 hover:text-blue-400"
            >
              Ver categorías
            </a>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["99+", "Productos"],
              ["Ecuador", "Cobertura"],
              ["Servientrega", "Envíos"],
              ["WhatsApp", "Atención"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
              >
                <p className="text-lg font-black">{value}</p>
                <p className="mt-1 text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white p-8 shadow-2xl">
            <span className="absolute left-5 top-5 z-10 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white">
              Producto destacado
            </span>

            <ProductImage
  image={featured.image}
  name={featured.name}
  className="aspect-square h-full w-full object-contain p-8"
/>
            <div className="mt-6 flex items-end justify-between gap-5 text-black">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  {featured.category}
                </p>
                <p className="mt-2 text-2xl font-black">{featured.name}</p>
              </div>

              <p className="text-3xl font-black">${featured.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
