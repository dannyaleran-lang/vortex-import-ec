"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase";
import { useCatalog } from "../context/CatalogContext";
import ProductImage from "../components/ProductImage";

type Draft = {
  name: string;
  price: string;
  category: string;
  available: boolean;
  featured: boolean;
};

type NewProduct = {
  name: string;
  code: string;
  price: string;
  category: string;
  available: boolean;
  featured: boolean;
};

const EMPTY_PRODUCT: NewProduct = {
  name: "",
  code: "",
  price: "",
  category: "Otros",
  available: true,
  featured: false,
};

function makeProductId() {
  return `P-${Date.now()}`;
}

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "png";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${Date.now()}-${baseName || "producto"}.${extension}`;
}

function getStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}

export default function AdminPage() {
  const { products, loading, error, reloadProducts } = useCatalog();

  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newProduct, setNewProduct] =
    useState<NewProduct>(EMPTY_PRODUCT);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const nextDrafts: Record<string, Draft> = {};

    for (const product of products) {
      nextDrafts[product.id] = {
        name: product.name,
        price: product.price.toFixed(2),
        category: product.category,
        available: product.available,
        featured: product.featured,
      };
    }

    setDrafts(nextDrafts);
  }, [products]);

  useEffect(() => {
    return () => {
      if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    };
  }, [newImagePreview]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.code.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized)
    );
  }, [products, query]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (signInError) {
      setLoginError("Correo o contraseña incorrectos.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function changeDraft(productId: string, changes: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        ...changes,
      },
    }));
  }

  function showMessage(
    text: string,
    type: "success" | "error"
  ) {
    setMessage(text);
    setMessageType(type);
  }

  function handleNewImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }

    setNewImage(file);
    setNewImagePreview(file ? URL.createObjectURL(file) : "");
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newProduct.name.trim();
    const code = newProduct.code.trim();
    const category = newProduct.category.trim();
    const price = Number(newProduct.price);

    if (!name || !category || Number.isNaN(price) || price < 0) {
      showMessage(
        "Completa correctamente el nombre, precio y categoría.",
        "error"
      );
      return;
    }

    if (!newImage) {
      showMessage("Selecciona una imagen para el producto.", "error");
      return;
    }

    setCreating(true);
    setMessage("");
    setMessageType("");

    const storagePath = sanitizeFileName(newImage.name);

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, newImage, {
        cacheControl: "3600",
        contentType: newImage.type,
        upsert: false,
      });

    if (uploadError) {
      showMessage(
        `No se pudo subir la imagen: ${uploadError.message}`,
        "error"
      );
      setCreating(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    const productId = makeProductId();

    const { error: insertError } = await supabase
      .from("products")
      .insert({
        id: productId,
        name,
        code,
        price,
        category,
        image: publicUrlData.publicUrl,
        available: newProduct.available,
        featured: newProduct.featured,
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      await supabase.storage
        .from("product-images")
        .remove([storagePath]);

      showMessage(
        `No se pudo crear el producto: ${insertError.message}`,
        "error"
      );
      setCreating(false);
      return;
    }

    setNewProduct(EMPTY_PRODUCT);
    setNewImage(null);

    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }

    setNewImagePreview("");
    await reloadProducts();

    showMessage("Producto creado correctamente.", "success");
    setCreating(false);
  }

  async function saveProduct(productId: string) {
    const draft = drafts[productId];

    if (!draft) return;

    const price = Number(draft.price);

    if (
      !draft.name.trim() ||
      !draft.category.trim() ||
      Number.isNaN(price) ||
      price < 0
    ) {
      showMessage(
        "Revisa el nombre, la categoría y el precio.",
        "error"
      );
      return;
    }

    setSavingId(productId);
    setMessage("");
    setMessageType("");

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: draft.name.trim(),
        price,
        category: draft.category.trim(),
        available: draft.available,
        featured: draft.featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (updateError) {
      showMessage(
        `No se pudo guardar: ${updateError.message}`,
        "error"
      );
      setSavingId(null);
      return;
    }

    await reloadProducts();
    showMessage("Producto guardado correctamente.", "success");
    setSavingId(null);
  }

  async function deleteProduct(productId: string, imageUrl: string) {
    const product = products.find((item) => item.id === productId);

    const confirmed = window.confirm(
      `¿Eliminar "${product?.name ?? "este producto"}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeletingId(productId);
    setMessage("");
    setMessageType("");

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      showMessage(
        `No se pudo eliminar: ${deleteError.message}`,
        "error"
      );
      setDeletingId(null);
      return;
    }

    const storagePath = getStoragePathFromPublicUrl(imageUrl);

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([storagePath]);

      if (storageError) {
        console.warn(
          "El producto se eliminó, pero no se pudo borrar su imagen:",
          storageError
        );
      }
    }

    await reloadProducts();
    showMessage("Producto eliminado correctamente.", "success");
    setDeletingId(null);
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">Comprobando sesión...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8"
        >
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
            Vortex Import EC
          </p>

          <h1 className="mt-4 text-3xl font-black">
            Acceso administrativo
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Inicia sesión con tu usuario administrador de Supabase.
          </p>

          <label className="mt-7 grid gap-2 text-sm font-bold">
            Correo
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="mt-5 grid gap-2 text-sm font-bold">
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          {loginError && (
            <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black transition hover:bg-blue-500"
          >
            Iniciar sesión
          </button>

          <a
            href="/"
            className="mt-3 block rounded-full border border-white/15 px-5 py-4 text-center font-bold"
          >
            Volver a la tienda
          </a>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
              Panel administrativo V2
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Productos Vortex
            </h1>
            <p className="mt-3 text-gray-400">
              Crea, edita y elimina productos directamente en Supabase.
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
              onClick={handleLogout}
              className="rounded-full border border-red-500/40 px-6 py-3 font-bold text-red-400"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {message && (
          <p
            className={`mt-6 rounded-2xl border p-4 text-sm ${
              messageType === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            {error}
          </p>
        )}

        <section className="mt-10 rounded-[2rem] border border-blue-500/25 bg-blue-500/[0.06] p-6 md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Nuevo producto
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Agregar al catálogo
            </h2>
          </div>

          <form
            onSubmit={createProduct}
            className="mt-7 grid gap-6 lg:grid-cols-[240px_1fr]"
          >
            <div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white">
                {newImagePreview ? (
                  <img
                    src={newImagePreview}
                    alt="Vista previa"
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <span className="text-5xl">📷</span>
                    <p className="mt-3 text-sm font-bold">
                      Vista previa
                    </p>
                  </div>
                )}
              </div>

              <label className="mt-4 block cursor-pointer rounded-full border border-white/15 px-5 py-3 text-center text-sm font-bold transition hover:border-blue-500">
                Seleccionar imagen
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleNewImage}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-center text-xs text-gray-500">
                PNG, JPEG o WebP. Máximo 3 MB.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">
                Nombre
                <input
                  required
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Código
                <input
                  value={newProduct.code}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="Ej. VTX-001"
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Precio
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Categoría
                <input
                  required
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={newProduct.available}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      available: event.target.checked,
                    }))
                  }
                />
                Disponible
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={newProduct.featured}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                />
                Producto destacado
              </label>

              <button
                type="submit"
                disabled={creating}
                className="rounded-full bg-blue-600 px-6 py-4 font-black transition hover:bg-blue-500 disabled:bg-gray-700 md:col-span-2"
              >
                {creating ? "Creando producto..." : "Crear producto"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Catálogo actual
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Editar productos
            </h2>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, código o categoría..."
            className="mt-6 w-full rounded-full border border-white/15 bg-white/[0.04] px-5 py-4 outline-none focus:border-blue-500"
          />

          <p className="mt-5 text-sm text-gray-400">
            Mostrando {filteredProducts.length} productos.
          </p>

          {loading ? (
            <p className="mt-8 text-gray-400">Cargando productos...</p>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredProducts.map((product) => {
                const draft = drafts[product.id];

                if (!draft) return null;

                return (
                  <article
                    key={product.id}
                    className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 xl:grid-cols-[100px_1.4fr_140px_180px_150px_220px]"
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
                          value={draft.name}
                          onChange={(event) =>
                            changeDraft(product.id, {
                              name: event.target.value,
                            })
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
                        value={draft.price}
                        onChange={(event) =>
                          changeDraft(product.id, {
                            price: event.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </label>

                    <label className="grid content-start gap-1 text-xs font-bold text-gray-400">
                      Categoría
                      <input
                        value={draft.category}
                        onChange={(event) =>
                          changeDraft(product.id, {
                            category: event.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </label>

                    <div className="grid content-start gap-3">
                      <label className="flex items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={draft.available}
                          onChange={(event) =>
                            changeDraft(product.id, {
                              available: event.target.checked,
                            })
                          }
                        />
                        Disponible
                      </label>

                      <label className="flex items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={draft.featured}
                          onChange={(event) =>
                            changeDraft(product.id, {
                              featured: event.target.checked,
                            })
                          }
                        />
                        Destacado
                      </label>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => saveProduct(product.id)}
                        disabled={savingId === product.id}
                        className="rounded-full bg-blue-600 px-4 py-3 text-sm font-black transition hover:bg-blue-500 disabled:bg-gray-700"
                      >
                        {savingId === product.id
                          ? "Guardando..."
                          : "Guardar cambios"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteProduct(product.id, product.image)
                        }
                        disabled={deletingId === product.id}
                        className="rounded-full border border-red-500/40 px-4 py-3 text-sm font-black text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === product.id
                          ? "Eliminando..."
                          : "Eliminar producto"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
