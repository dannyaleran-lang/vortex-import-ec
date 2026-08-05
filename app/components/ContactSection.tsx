export default function ContactSection() {
  const phones = [
    ["099 265 6247", "593992656247"],
    ["098 460 5793", "593984605793"],
    ["097 934 0125", "593979340125"],
    ["098 386 2090", "593983862090"],
  ];

  return (
    <section id="contacto" className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
            Contáctanos
          </p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Estamos para ayudarte
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-gray-400">
            Atención desde Quito y envíos a todo Ecuador. Consulta disponibilidad,
            formas de pago y costo de envío antes de confirmar tu compra.
          </p>

          <div className="mt-8 space-y-3 text-gray-300">
            <p><strong>Ciudad:</strong> Quito, Ecuador</p>
            <p><strong>Correo:</strong> dannyaleran@gmail.com</p>
            <p><strong>Envíos:</strong> Servientrega</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {phones.map(([label, number]) => (
            <a
              key={number}
              href={`https://wa.me/${number}?text=Hola%2C%20deseo%20informaci%C3%B3n%20sobre%20Vortex%20Import%20EC.`}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-blue-500/50"
            >
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                WhatsApp
              </p>
              <p className="mt-3 text-2xl font-black">{label}</p>
              <p className="mt-2 text-sm text-gray-400">Abrir conversación</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
