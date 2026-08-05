export default function PromoBanner() {
  return (
    <section className="px-6 py-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-blue-500/30 bg-blue-600 px-7 py-14 md:px-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-black/20 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
              Atención inmediata
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black md:text-5xl">
              ¿Necesitas ayuda para elegir un producto?
            </h2>
            <p className="mt-4 max-w-2xl text-blue-100">
              Escríbenos y recibe asesoría personalizada para encontrar la mejor
              opción para tu hogar.
            </p>
          </div>

          <a
            href="https://wa.me/593992656247?text=Hola%2C%20necesito%20ayuda%20para%20elegir%20un%20producto."
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-white px-8 py-4 text-center text-lg font-black text-blue-700 transition hover:bg-blue-50"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
