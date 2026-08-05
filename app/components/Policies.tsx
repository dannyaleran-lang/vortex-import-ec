export default function Policies() {
  const items = [
    {
      title: "Envíos",
      text: "Los envíos se realizan mediante Servientrega. El costo y tiempo dependen de la ciudad y dirección de entrega.",
    },
    {
      title: "Disponibilidad",
      text: "La existencia del producto se confirma antes de recibir el pago.",
    },
    {
      title: "Pagos",
      text: "Aceptamos transferencias, PayPhone y enlaces de pago con tarjeta cuando estén disponibles.",
    },
    {
      title: "Garantía",
      text: "La garantía depende del producto. Conserva tu comprobante y consulta las condiciones antes de comprar.",
    },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
          Información de compra
        </p>
        <h2 className="mt-4 text-4xl font-black md:text-5xl">
          Compra con información clara
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
