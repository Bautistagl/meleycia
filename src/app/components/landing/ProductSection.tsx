"use client";


import "./product-section.css";
import { useEffect, useState } from "react";
import { Producto } from "@/types";
import { supabase } from "@/lib/supabase";

import { ProductCard } from "@/app/productos/components/ProductCard";

export default function ProductSection() {
  const [recentProducts, setRecentProducts] = useState<Producto[]>([]);

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

  return (
    <section className="product-section">
      <h2>OFERTAS DESTACADAS</h2>

      <div className="products-container">
        {recentProducts.map((product) => (
          <ProductCard key={product.id} producto={product} />
        ))}
      </div>
    </section>
  );
}
