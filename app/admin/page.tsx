"use client";

import { useMemo, useState } from "react";
import { useCatalog } from "../context/CatalogContext";
import ProductImage from "../components/ProductImage";

const ADMIN_PIN = "2519";

export default function AdminPage() {
  const { products, updateProduct, resetProduct, resetCatalog } = useCatalog();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.code.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized)
    );
  }, [products, query]);

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
            Vortex Import EC
          </p>
          <h1 className="mt-4 text-3xl font-black">Panel administrativo</h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Este panel es una versión local de prueba. Los cambios se guardan
            únicamente en este navegador.
          </p>

          <label className="mt-7 grid gap-2 text-sm font-bold">
            Clave de acceso
            <input
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && pin === ADMIN_PIN) {
                  setUnlocked(true);
                }
              }}
              placeholder="Ingresa la clave"
              className="rounded-2xl border border-white/15 bg-black px-4 py-3 outline-none focus:border-blue-500"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (pin === ADMIN_PIN) setUnlocked(true);
              else alert("Clave incorrecta");
            }}
            className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 font-black transition hover:bg-blue-500"
          >
            Entrar
          </button>

          <a
            href="/"
            className="mt-3 block rounded-full border border-white/15 px-5 py-4 text-center font-bold"
          >
            Volver a la tienda
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
              Administración local
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Productos Vortex
            </h1>
            <p className="mt-3 text-gray-400">
              Edita precios, disponibilidad, destacados, nombre y categoría.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="rounded-full border border-white/15 px-6 py-3 text-center font-bold"
            >
              Ver tienda
            </a>
            <button
              type="button"
              onClick={() => {
                if (confirm("¿Deseas borrar todos los cambios locales?")) {
                  resetCatalog();
                }
              }}
              className="rounded-full border border-red-500/40 px-6 py-3 font-bold text-red-400"
            >
              Restablecer catálogo
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm leading-6 text-yellow-100">
          <strong>Importante:</strong> esta versión todavía no usa una base de
          datos. Los cambios se guardan solo en este navegador y dispositivo.
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, código o categoría..."
          className="mt-8 w-full rounded-full border border-white/15 bg-white/[0.04] px-5 py-4 outline-none focus:border-blue-500"
        />

        <p className="mt-5 text-sm text-gray-400">
          Mostrando {filtered.length} productos.
        </p>

        <div className="mt-6 space-y-4">
          {filtered.map((product) => (
            <article
              key={product.id}
              className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:grid-cols-[100px_1.3fr_140px_180px_130px_120px]"
            >
              <div className="h-24 overflow-hidden rounded-2xl bg-white">
                <ProductImage
  image={product.image}
  name={product.name}
  className="h-full w-full object-contain p-2"
  fallbackClassName="h-full w-full"
/>
              </div>

              <div className="grid gap-3">
                <label className="grid gap-1 text-xs font-bold text-gray-400">
                  Nombre
                  <input
                    value={product.name}
                    onChange={(event) =>
                      updateProduct(product.id, { name: event.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </label>

                <p className="text-xs text-gray-500">
                  Código: {product.code || "Sin código"}
                </p>
              </div>

              <label className="grid content-start gap-1 text-xs font-bold text-gray-400">
                Precio
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.price}
                  onChange={(event) =>
                    updateProduct(product.id, {
                      price: Number(event.target.value),
                    })
                  }
                  className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </label>

              <label className="grid content-start gap-1 text-xs font-bold text-gray-400">
                Categoría
                <input
                  value={product.category}
                  onChange={(event) =>
                    updateProduct(product.id, { category: event.target.value })
                  }
                  className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </label>

              <div className="grid content-start gap-3">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={product.available}
                    onChange={(event) =>
                      updateProduct(product.id, {
                        available: event.target.checked,
                      })
                    }
                  />
                  Disponible
                </label>

                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={product.featured}
                    onChange={(event) =>
                      updateProduct(product.id, {
                        featured: event.target.checked,
                      })
                    }
                  />
                  Destacado
                </label>
              </div>

              <button
                type="button"
                onClick={() => resetProduct(product.id)}
                className="h-fit rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-blue-500"
              >
                Restablecer
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
