"use client";

import { useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";

type CheckoutProps = {
  open: boolean;
  onClose: () => void;
};

export default function CheckoutModal({ open, onClose }: CheckoutProps) {
  const { cart, total } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Quito");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Transferencia bancaria");

  const canSend = useMemo(
    () =>
      cart.length > 0 &&
      name.trim().length >= 3 &&
      phone.trim().length >= 8 &&
      city.trim().length >= 2 &&
      address.trim().length >= 5,
    [cart, name, phone, city, address]
  );

  if (!open) return null;

  const orderLines = cart.map(
    (item) =>
      `${item.quantity} x ${item.name} (${item.code || item.id}) — $${(
        item.price * item.quantity
      ).toFixed(2)}`
  );

  const message = [
    "Hola, deseo confirmar este pedido en Vortex Import EC:",
    "",
    ...orderLines,
    "",
    `Total de productos: $${total.toFixed(2)}`,
    "",
    "DATOS DEL CLIENTE",
    `Nombre: ${name}`,
    `Teléfono: ${phone}`,
    `Ciudad: ${city}`,
    `Dirección: ${address}`,
    `Método de pago: ${payment}`,
    "",
    "Por favor, confirmen el costo de envío por Servientrega y los datos para realizar el pago.",
  ].join("\n");

  const whatsappUrl = `https://wa.me/593992656247?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <section className="relative z-10 max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#090909] p-6 shadow-2xl md:p-9">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Finalizar compra
            </p>
            <h2 className="mt-2 text-3xl font-black">Datos del pedido</h2>
            <p className="mt-2 text-sm text-gray-400">
              Completa tus datos. El pedido se enviará por WhatsApp para confirmar
              disponibilidad, envío y pago.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-blue-500"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Nombre completo
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Danny Romero"
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Teléfono
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="09XXXXXXXX"
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Ciudad
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Quito"
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Método de pago
            <select
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
              className="rounded-2xl border border-white/15 bg-[#111] px-4 py-3 font-normal outline-none focus:border-blue-500"
            >
              <option>Transferencia bancaria</option>
              <option>PayPhone</option>
              <option>Tarjeta — confirmar enlace de pago</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Dirección de entrega
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Sector, calle principal, numeración y referencia"
              rows={4}
              className="resize-none rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Productos</span>
            <span className="font-bold">{cart.length}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-2xl font-black">${total.toFixed(2)}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            El costo de envío se confirma según la ciudad y dirección del cliente.
          </p>
        </div>

        <a
          href={canSend ? whatsappUrl : undefined}
          target="_blank"
          rel="noreferrer"
          className={`mt-7 block rounded-full px-6 py-4 text-center font-black transition ${
            canSend
              ? "bg-blue-600 hover:bg-blue-500"
              : "pointer-events-none bg-gray-800 text-gray-500"
          }`}
        >
          Enviar pedido por WhatsApp
        </a>
      </section>
    </div>
  );
}
