"use client";

import "./product-section.css";
import { useEffect, useState, useRef } from "react"; // Importa useRef
import { Producto } from "@/types";
import { supabase } from "@/lib/supabase";

import { ProductCard } from "@/app/productos/components/ProductCard";

export default function ProductSection() {
  const [recentProducts, setRecentProducts] = useState<Producto[]>([]);
  // 1. Crea una referencia para el contenedor de productos
  const productsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecentProducts() {
      const { data, error } = await supabase
        .from("productos")
        .select(
          "id, nombre, categoria, precio, stock, created_at, descripcion, marca, precio_oferta, imageUrl, destacado"
        )
        .eq("destacado", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        const products = data.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precio: p.precio,
          stock: p.stock,
          description: p.descripcion,
          marca: p.marca,
          imageUrl: p.imageUrl,
          precio_oferta: p.precio_oferta,
          destacado: p.destacado,
        }));
        setRecentProducts(products);
      }
    }

    fetchRecentProducts();
  }, []);

  // 2. Funciones para desplazar el carrusel
  const scrollLeft = () => {
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollBy({
        left: -productsContainerRef.current.offsetWidth / 2, // Desplaza la mitad del ancho del contenedor
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollBy({
        left: productsContainerRef.current.offsetWidth / 2, // Desplaza la mitad del ancho del contenedor
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="product-section">
      <h2>OFERTAS DESTACADAS</h2>

      {/* Nuevo contenedor para envolver el carrusel y los botones */}
      <div className="carousel-wrapper">
        <button onClick={scrollLeft} className="carousel-button prev">
          &lt;
        </button>
        <div className="products-container" ref={productsContainerRef}>
          {recentProducts.map((product) => (
            <ProductCard key={product.id} producto={product} />
          ))}
        </div>
        <button onClick={scrollRight} className="carousel-button next">
          &gt;
        </button>
      </div>
    </section>
  );
}