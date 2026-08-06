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

type ProductDraft = {
  name: string;
  price: string;
  salePrice: string;
  category: string;
  description: string;
  stock: string;
  available: boolean;
  featured: boolean;
  onSale: boolean;
};

type NewProductDraft = ProductDraft & {
  code: string;
};

const EMPTY_NEW_PRODUCT: NewProductDraft = {
  name: "",
  code: "",
  price: "",
  salePrice: "",
  category: "Otros",
  description: "",
  stock: "0",
  available: true,
  featured: false,
  onSale: false,
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
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newProduct, setNewProduct] =
    useState<NewProductDraft>(EMPTY_NEW_PRODUCT);
  const [newMainImage, setNewMainImage] = useState<File | null>(null);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);
  const [mainPreview, setMainPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const [galleryProductId, setGalleryProductId] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

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
    const nextDrafts: Record<string, ProductDraft> = {};

    for (const product of products) {
      nextDrafts[product.id] = {
        name: product.name,
        price: product.price.toFixed(2),
        salePrice:
          product.sale_price !== null &&
          product.sale_price !== undefined
            ? Number(product.sale_price).toFixed(2)
            : "",
        category: product.category,
        description: product.description ?? "",
        stock: String(product.stock ?? 0),
        available: product.available,
        featured: product.featured,
        onSale: Boolean(product.on_sale),
      };
    }

    setDrafts(nextDrafts);
  }, [products]);

  useEffect(() => {
    return () => {
      if (mainPreview) URL.revokeObjectURL(mainPreview);
      for (const preview of galleryPreviews) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [mainPreview, galleryPreviews]);

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

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  function changeDraft(
    productId: string,
    changes: Partial<ProductDraft>
  ) {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        ...changes,
      },
    }));
  }

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

  function handleMainImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (mainPreview) URL.revokeObjectURL(mainPreview);

    setNewMainImage(file);
    setMainPreview(file ? URL.createObjectURL(file) : "");
  }

  function handleNewGalleryImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []).slice(0, 5);

    for (const preview of galleryPreviews) {
      URL.revokeObjectURL(preview);
    }

    setNewGalleryImages(files);
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function uploadImage(file: File) {
    const storagePath = sanitizeFileName(file.name);

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    return {
      url: data.publicUrl,
      storagePath,
    };
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newProduct.name.trim();
    const code = newProduct.code.trim();
    const category = newProduct.category.trim();
    const description = newProduct.description.trim();
    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);
    const salePrice = newProduct.salePrice
      ? Number(newProduct.salePrice)
      : null;

    if (
      !name ||
      !category ||
      Number.isNaN(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      showMessage(
        "Revisa nombre, categoría, precio y stock.",
        "error"
      );
      return;
    }

    if (
      newProduct.onSale &&
      (salePrice === null ||
        Number.isNaN(salePrice) ||
        salePrice < 0 ||
        salePrice >= price)
    ) {
      showMessage(
        "El precio de oferta debe ser menor al precio normal.",
        "error"
      );
      return;
    }

    if (!newMainImage) {
      showMessage("Selecciona una imagen principal.", "error");
      return;
    }

    setCreating(true);
    setMessage("");
    setMessageType("");

    const uploadedPaths: string[] = [];

    try {
      const mainUpload = await uploadImage(newMainImage);
      uploadedPaths.push(mainUpload.storagePath);

      const productId = makeProductId();

      const { error: insertError } = await supabase
        .from("products")
        .insert({
          id: productId,
          name,
          code,
          price,
          sale_price: newProduct.onSale ? salePrice : null,
          on_sale: newProduct.onSale,
          category,
          description,
          stock,
          image: mainUpload.url,
          available: stock > 0 && newProduct.available,
          featured: newProduct.featured,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (newGalleryImages.length > 0) {
        const galleryRows = [];

        for (let index = 0; index < newGalleryImages.length; index++) {
          const uploaded = await uploadImage(newGalleryImages[index]);
          uploadedPaths.push(uploaded.storagePath);

          galleryRows.push({
            product_id: productId,
            image_url: uploaded.url,
            position: index,
          });
        }

        const { error: galleryError } = await supabase
          .from("product_images")
          .insert(galleryRows);

        if (galleryError) {
          throw new Error(galleryError.message);
        }
      }

      setNewProduct(EMPTY_NEW_PRODUCT);
      setNewMainImage(null);
      setNewGalleryImages([]);

      if (mainPreview) URL.revokeObjectURL(mainPreview);
      for (const preview of galleryPreviews) {
        URL.revokeObjectURL(preview);
      }

      setMainPreview("");
      setGalleryPreviews([]);

      await reloadProducts();
      showMessage("Producto creado correctamente.", "success");
    } catch (creationError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("product-images")
          .remove(uploadedPaths);
      }

      showMessage(
        `No se pudo crear el producto: ${
          creationError instanceof Error
            ? creationError.message
            : "Error desconocido"
        }`,
        "error"
      );
    } finally {
      setCreating(false);
    }
  }

  async function saveProduct(productId: string) {
    const draft = drafts[productId];
    if (!draft) return;

    const price = Number(draft.price);
    const stock = Number(draft.stock);
    const salePrice = draft.salePrice
      ? Number(draft.salePrice)
      : null;

    if (
      !draft.name.trim() ||
      !draft.category.trim() ||
      Number.isNaN(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      showMessage(
        "Revisa nombre, categoría, precio y stock.",
        "error"
      );
      return;
    }

    if (
      draft.onSale &&
      (salePrice === null ||
        Number.isNaN(salePrice) ||
        salePrice < 0 ||
        salePrice >= price)
    ) {
      showMessage(
        "El precio de oferta debe ser menor al precio normal.",
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
        sale_price: draft.onSale ? salePrice : null,
        on_sale: draft.onSale,
        category: draft.category.trim(),
        description: draft.description.trim(),
        stock,
        available: stock > 0 && draft.available,
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

  async function deleteProduct(
    productId: string,
    imageUrl: string
  ) {
    const product = products.find((item) => item.id === productId);

    const confirmed = window.confirm(
      `¿Eliminar "${product?.name ?? "este producto"}"?`
    );

    if (!confirmed) return;

    setDeletingId(productId);
    setMessage("");
    setMessageType("");

    const { data: galleryRows } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId);

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

    const storagePaths = [
      imageUrl,
      ...(galleryRows ?? []).map((row) =>
        String(row.image_url)
      ),
    ]
      .map(getStoragePathFromPublicUrl)
      .filter((value): value is string => Boolean(value));

    if (storagePaths.length > 0) {
      await supabase.storage
        .from("product-images")
        .remove(storagePaths);
    }

    await reloadProducts();
    showMessage("Producto eliminado correctamente.", "success");
    setDeletingId(null);
  }

  async function addGalleryImages() {
    if (!galleryProductId || galleryFiles.length === 0) {
      showMessage(
        "Selecciona un producto y al menos una imagen.",
        "error"
      );
      return;
    }

    setUploadingGallery(true);
    setMessage("");
    setMessageType("");

    try {
      const { count } = await supabase
        .from("product_images")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("product_id", galleryProductId);

      const startPosition = count ?? 0;
      const rows = [];

      for (let index = 0; index < galleryFiles.length; index++) {
        const uploaded = await uploadImage(galleryFiles[index]);

        rows.push({
          product_id: galleryProductId,
          image_url: uploaded.url,
          position: startPosition + index,
        });
      }

      const { error: galleryError } = await supabase
        .from("product_images")
        .insert(rows);

      if (galleryError) {
        throw new Error(galleryError.message);
      }

      setGalleryFiles([]);
      setGalleryProductId("");
      await reloadProducts();
      showMessage(
        "Imágenes adicionales agregadas correctamente.",
        "success"
      );
    } catch (galleryError) {
      showMessage(
        `No se pudieron agregar las imágenes: ${
          galleryError instanceof Error
            ? galleryError.message
            : "Error desconocido"
        }`,
        "error"
      );
    } finally {
      setUploadingGallery(false);
    }
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

          <label className="mt-7 grid gap-2 text-sm font-bold">
            Correo
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
            className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black"
          >
            Iniciar sesión
          </button>
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
              Panel administrativo V4
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Gestión completa
            </h1>
            <p className="mt-3 text-gray-400">
              Productos, imágenes, stock y ofertas.
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
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Nuevo producto
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Agregar al catálogo
          </h2>

          <form
            onSubmit={createProduct}
            className="mt-7 grid gap-6 lg:grid-cols-[260px_1fr]"
          >
            <div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white">
                {mainPreview ? (
                  <img
                    src={mainPreview}
                    alt="Vista previa"
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-500">
                    Imagen principal
                  </p>
                )}
              </div>

              <label className="mt-4 block cursor-pointer rounded-full border border-white/15 px-5 py-3 text-center text-sm font-bold">
                Seleccionar principal
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleMainImage}
                  className="hidden"
                />
              </label>

              <label className="mt-3 block cursor-pointer rounded-full border border-white/15 px-5 py-3 text-center text-sm font-bold">
                Seleccionar galería
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleNewGalleryImages}
                  className="hidden"
                />
              </label>

              {galleryPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {galleryPreviews.map((preview) => (
                    <img
                      key={preview}
                      src={preview}
                      alt="Galería"
                      className="aspect-square rounded-xl bg-white object-contain p-1"
                    />
                  ))}
                </div>
              )}
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
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal"
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
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Precio normal
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
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Precio de oferta
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.salePrice}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      salePrice: event.target.value,
                    }))
                  }
                  disabled={!newProduct.onSale}
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal disabled:opacity-40"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Stock
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={newProduct.stock}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal"
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
                  className="rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold md:col-span-2">
                Descripción
                <textarea
                  rows={5}
                  value={newProduct.description}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="resize-none rounded-2xl border border-white/15 bg-black px-4 py-3 font-normal"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={newProduct.onSale}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      onSale: event.target.checked,
                    }))
                  }
                />
                Producto en oferta
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
                Destacado
              </label>

              <button
                type="submit"
                disabled={creating}
                className="rounded-full bg-blue-600 px-6 py-4 font-black md:col-span-2 disabled:bg-gray-700"
              >
                {creating ? "Creando..." : "Crear producto"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-black">
            Agregar imágenes a un producto existente
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <select
              value={galleryProductId}
              onChange={(event) =>
                setGalleryProductId(event.target.value)
              }
              className="rounded-2xl border border-white/15 bg-black px-4 py-3"
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.code || product.id}
                </option>
              ))}
            </select>

            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setGalleryFiles(
                  Array.from(event.target.files ?? []).slice(0, 5)
                )
              }
              className="rounded-2xl border border-white/15 bg-black px-4 py-3"
            />

            <button
              type="button"
              onClick={addGalleryImages}
              disabled={uploadingGallery}
              className="rounded-full bg-blue-600 px-6 py-3 font-black disabled:bg-gray-700"
            >
              {uploadingGallery ? "Subiendo..." : "Subir imágenes"}
            </button>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">
            Editar productos
          </h2>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, código o categoría..."
            className="mt-6 w-full rounded-full border border-white/15 bg-white/[0.04] px-5 py-4 outline-none"
          />

          {loading ? (
            <p className="mt-8 text-gray-400">
              Cargando productos...
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredProducts.map((product) => {
                const draft = drafts[product.id];
                if (!draft) return null;

                return (
                  <article
                    key={product.id}
                    className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 xl:grid-cols-[100px_1.3fr_120px_120px_160px_220px]"
                  >
                    <div className="h-24 overflow-hidden rounded-2xl bg-white">
                      <ProductImage
                        image={product.image}
                        name={product.name}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>

                    <div className="grid gap-3">
                      <input
                        value={draft.name}
                        onChange={(event) =>
                          changeDraft(product.id, {
                            name: event.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-black px-3 py-2"
                      />

                      <textarea
                        rows={3}
                        value={draft.description}
                        onChange={(event) =>
                          changeDraft(product.id, {
                            description: event.target.value,
                          })
                        }
                        placeholder="Descripción"
                        className="resize-none rounded-xl border border-white/10 bg-black px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.price}
                        onChange={(event) =>
                          changeDraft(product.id, {
                            price: event.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-black px-3 py-2"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.salePrice}
                        onChange={(event) =>
                          changeDraft(product.id, {
                            salePrice: event.target.value,
                          })
                        }
                        disabled={!draft.onSale}
                        placeholder="Oferta"
                        className="rounded-xl border border-white/10 bg-black px-3 py-2 disabled:opacity-40"
                      />
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.stock}
                      onChange={(event) =>
                        changeDraft(product.id, {
                          stock: event.target.value,
                        })
                      }
                      className="h-fit rounded-xl border border-white/10 bg-black px-3 py-2"
                    />

                    <div className="grid content-start gap-3">
                      <label className="flex items-center gap-2 text-sm">
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

                      <label className="flex items-center gap-2 text-sm">
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

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={draft.onSale}
                          onChange={(event) =>
                            changeDraft(product.id, {
                              onSale: event.target.checked,
                            })
                          }
                        />
                        En oferta
                      </label>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => saveProduct(product.id)}
                        disabled={savingId === product.id}
                        className="rounded-full bg-blue-600 px-4 py-3 text-sm font-black disabled:bg-gray-700"
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
                        className="rounded-full border border-red-500/40 px-4 py-3 text-sm font-black text-red-400"
                      >
                        {deletingId === product.id
                          ? "Eliminando..."
                          : "Eliminar"}
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
