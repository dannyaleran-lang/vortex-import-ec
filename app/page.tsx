import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import Benefits from "./components/Benefits";
import Shop from "./components/Shop";
import PromoBanner from "./components/PromoBanner";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <Navbar />
      <Hero />

      <div id="destacados">
        <FeaturedProducts />
      </div>

      <Benefits />
      <Shop />
      <PromoBanner />
      <Footer />
    </main>
  );
}
