"use client";

import { useState } from "react";
import { useStore } from "../context/StoreContext";
import CheckoutModal from "./CheckoutModal";
import ProductImage from "./ProductImage";

export default function CartDrawer() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const {
    cart,
    cartOpen,
    setCartOpen,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    total,
  } = useStore();

  return (
    <>
      {cartOpen && (
        <button
          type="button"
          aria-label="Cerrar carrito"
          onClick={() => setCartOpen(false)}
          className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#080808] shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Tu compra
            </p>
            <h2 className="mt-1 text-2xl font-black">Carrito</h2>
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:border-blue-500"
          >
            Cerrar
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-5xl">🛒</span>
              <p className="mt-4 text-xl font-black">Tu carrito está vacío</p>
              <p className="mt-2 text-sm text-gray-400">
                Agrega productos para preparar tu pedido.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                    <ProductImage
                      image={item.image}
                      name={item.name}
                      className="h-full w-full object-contain p-2"
                      fallbackClassName="h-full w-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.code || "Sin código"}
                    </p>
                    <p className="mt-2 font-black text-blue-400">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-white/15">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                      className="px-4 py-2"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                      className="px-4 py-2"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm font-bold text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total</span>
            <span className="text-3xl font-black">${total.toFixed(2)}</span>
          </div>

          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            disabled={!cart.length}
            className="mt-5 w-full rounded-full bg-blue-600 px-5 py-4 text-center font-black transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500"
          >
            Continuar con el pedido
          </button>
        </div>
      </aside>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
