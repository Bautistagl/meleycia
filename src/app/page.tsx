import AboutUs from "./components/AboutUs";
import Contact from "./components/Contact";
import Features from "./components/Features";
import FeaturesSection from "./components/Features-section";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductSection from "./components/ProductSection";

import Suppliers from "./components/Proveedores";

export default function Home() {
  return (
    <div className="">
      <Navbar />
      <FeaturesSection />
      <Suppliers />
      <Features />
      <ProductSection />
      <AboutUs />
      <Footer />
    </div>
  );
}
