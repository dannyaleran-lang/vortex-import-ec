import Navbar from "./components/Navbar";
import Shop from "./components/Shop";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section id="inicio" className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-32">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-bold text-blue-400">
            Envíos seguros a todo Ecuador
          </p>
          <h1 className="mt-7 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
            Innovación que llega a tu hogar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400 md:text-xl">
            Cocina, electrodomésticos y productos para el hogar con atención personalizada desde Quito.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="#tienda" className="rounded-full bg-blue-600 px-8 py-4 text-center text-lg font-bold transition hover:bg-blue-500">
              Ver productos
            </a>
            <a href="#categorias" className="rounded-full border border-white/20 px-8 py-4 text-center text-lg font-bold transition hover:border-blue-500 hover:text-blue-400">
              Explorar categorías
            </a>
          </div>

          <div className="mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["99", "Productos"],
              ["Todo Ecuador", "Cobertura"],
              ["Servientrega", "Envíos"],
              ["WhatsApp", "Atención"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-lg font-black">{value}</p>
                <p className="mt-1 text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Shop />
      <Footer />
    </main>
  );
}
