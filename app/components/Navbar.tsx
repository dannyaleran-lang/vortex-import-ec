"use client";

import Image from "next/image";
import { useState } from "react";
import { useStore } from "../context/StoreContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setCartOpen } = useStore();

  const whatsappUrl =
    "https://wa.me/593992656247?text=Hola%2C%20deseo%20informaci%C3%B3n%20sobre%20los%20productos%20de%20Vortex%20Import%20EC.";

  const links = [
    ["Inicio", "#inicio"],
    ["Tienda", "#tienda"],
    ["Categorías", "#categorias"],
    ["Contacto", "#contacto"],
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <Image
            src="/logo/logo.jpeg"
            alt="Vortex Import EC"
            width={58}
            height={58}
            className="h-12 w-12 rounded-full object-cover"
            priority
          />
          <div>
            <p className="text-base font-black tracking-[0.18em]">VORTEX</p>
            <p className="text-[10px] tracking-[0.28em] text-blue-400">IMPORT EC</p>
          </div>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-gray-300 transition hover:text-blue-400">
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold">
            ES / EN
          </span>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold transition hover:border-blue-500"
          >
            Carrito
            <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs">
              {cartCount}
            </span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold transition hover:bg-blue-500"
          >
            WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-lg border border-white/15 p-2.5 lg:hidden"
          aria-label="Abrir menú"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="my-1.5 block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-black px-5 py-6 lg:hidden">
          <div className="flex flex-col gap-5">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-gray-200">
                {label}
              </a>
            ))}

            <button
              type="button"
              onClick={() => {
                setCartOpen(true);
                setMenuOpen(false);
              }}
              className="rounded-full border border-white/15 px-5 py-3 text-left font-bold"
            >
              Carrito ({cartCount})
            </button>

            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-blue-600 px-5 py-3 text-center font-bold">
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
