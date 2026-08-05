export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-white/10 px-6 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <div>
          <p className="text-xl font-black tracking-[0.15em]">VORTEX IMPORT EC</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
            Productos para cocina y hogar con envíos mediante Servientrega a todo Ecuador.
          </p>
        </div>

        <div>
          <p className="font-bold">Contacto</p>
          <p className="mt-4 text-sm text-gray-400">Quito, Ecuador</p>
          <p className="mt-2 text-sm text-gray-400">dannyaleran@gmail.com</p>
        </div>

        <div>
          <p className="font-bold">WhatsApp</p>
          <div className="mt-4 space-y-2 text-sm text-gray-400">
            <p>099 265 6247</p>
            <p>098 460 5793</p>
            <p>097 934 0125</p>
            <p>098 386 2090</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-sm text-gray-500">
        © 2026 Vortex Import EC. Todos los derechos reservados.
      </div>
    </footer>
  );
}
