export default function Benefits() {
  const benefits = [
    {
      icon: "🚚",
      title: "Envíos nacionales",
      text: "Entregas mediante Servientrega a diferentes ciudades del Ecuador.",
    },
    {
      icon: "💬",
      title: "Atención personalizada",
      text: "Asesoría rápida por WhatsApp antes y después de tu compra.",
    },
    {
      icon: "🛡️",
      title: "Compra con confianza",
      text: "Información clara de cada producto, su precio y disponibilidad.",
    },
    {
      icon: "✨",
      title: "Variedad para tu hogar",
      text: "Cocina, organización, climatización y electrodomésticos.",
    },
  ];

  return (
    <section className="border-y border-white/10 bg-white/[0.025] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
          Confianza Vortex
        </p>
        <h2 className="mt-4 text-4xl font-black md:text-5xl">
          Una compra más sencilla
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-3xl border border-white/10 bg-black p-7"
            >
              <span className="text-4xl">{benefit.icon}</span>
              <h3 className="mt-6 text-xl font-black">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                {benefit.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
