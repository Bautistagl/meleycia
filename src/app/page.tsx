"use client";

import useAuth from "@/hooks/useAuth";
import AboutUs from "./components/landing/AboutUs";
import BannerCarousel from "./components/landing/banner-carousel";

import Features from "./components/landing/Features";
import FeaturesSection from "./components/landing/Features-section";
import Footer from "./components/landing/Footer";
import Navbar from "./components/landing/Navbar";
import ProductSection from "./components/landing/ProductSection";

import Suppliers from "./components/landing/Proveedores";

export default function Home() {
  // Custom banner data
  const customBanners = [
    {
      id: "1",
      src: "/energizer_banner.jpg",
      alt: "Oferta especial en baterías Energizer",
      title: "50% OFF Baterías",
      subtitle: "Energizer - Oferta por tiempo limitado",
      ctaText: "Ver Ofertas",
      ctaLink: "/ofertas",
    },
    {
      id: "2",
      src: "/energizer_banner.jpg",
      alt: "Promoción productos de limpieza",
      title: "Productos de Limpieza",
      subtitle: "2x1 en productos seleccionados de marcas premium",
      ctaText: "Comprar Ahora",
      ctaLink: "/limpieza",
    },
    {
      id: "3",
      src: "/energizer_banner.jpg",
      alt: "Descuentos en herramientas profesionales",
      title: "Herramientas Profesionales",
      subtitle: "Hasta 30% de descuento en toda la línea",
      ctaText: "Ver Catálogo",
      ctaLink: "/herramientas",
    },
  ];
  const { user } = useAuth();

  return (
    <div className="">
      <Navbar />
      <FeaturesSection />
      <BannerCarousel
        images={customBanners}
        autoPlay={true}
        autoPlayInterval={4000}
        showIndicators={true}
        showNavigation={true}
      />
      <Suppliers />
      <Features />
      <ProductSection />
      <AboutUs />
      <Footer />
    </div>
  );
}
