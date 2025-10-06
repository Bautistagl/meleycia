"use client"

import { useState, useEffect, useCallback } from "react";
import { Search } from "./components/Search";
import { Filters } from "./components/Filters";
import { ProductCard } from "./components/ProductCard";
import { Pagination } from "./components/Pagination";
import styles from "./products.module.css";
import Navbar from "../components/landing/Navbar";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Producto[]>([]);
  // Se ha eliminado 'filteredProducts' ya que el filtrado y paginación se hace en Supabase.
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0); // Total de productos que cumplen los filtros
  const productsPerPage = 12;
  const ORDER_BY_COLUMN = "id";

  const fetchProductos = useCallback(async () => {
    setIsLoading(true);

    // Calcular el rango para Supabase (paginación en el servidor)
    const from = (currentPage - 1) * productsPerPage;
    const to = from + productsPerPage - 1;

    // Iniciar la consulta, solicitando el conteo exacto de filas filtradas
    let query = supabase
      .from("productos")
      .select("*", { count: "exact" }) // count: "exact" es clave
      .order(ORDER_BY_COLUMN, { ascending: false });

    // Aplicar filtros de texto (nombre y descripción)
    if (searchTerm) {
      query = query.or(
        `nombre.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`
      );
    }

    // Aplicar filtros de categoría
    if (filters.category) {
      query = query.eq("categoria", filters.category);
    }

    // Aplicar filtros de marca
    if (filters.brand) {
      query = query.eq("marca", filters.brand);
    }

    // Aplicar la paginación (rango) y ejecutar
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Error fetching productos:", error.message);
      setIsLoading(false);
      return;
    }

    // 'data' contiene solo los 12 productos de la página actual
    setProducts(data || []);
    // 'count' contiene el total de productos que cumplen los filtros
    setTotalProducts(count || 0);
    setIsLoading(false);
  }, [currentPage, searchTerm, filters]);

  useEffect(() => {
    // Cuando cambian los filtros o la página, recargamos los datos del servidor
    fetchProductos();
  }, [fetchProductos]);

  useEffect(() => {
    // Si cambia el término de búsqueda o filtros, siempre volvemos a la página 1.
    // Si ya estamos en la 1, 'fetchProductos' se llama por la dependencia 'fetchProductos'
    // en el useEffect anterior.
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, filters]);

  // Se eliminó el useEffect que realizaba el filtrado local.

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get unique categories and brands for filters
  const [brands, setBrands] = useState<
    { id: string | number; marca: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { id: string | number; nombre: string }[]
  >([]);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase.from("marcas").select("id, marca");
      if (error) {
        console.error("Error fetching brands:", error.message);
        return;
      }
      setBrands(data as { id: string | number; marca: string }[]);
    };

    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre");
      if (error) {
        console.error("Error fetching categorias:", error.message);
        return;
      }
      setCategories(data as { id: string | number; nombre: string }[]);
    };

    fetchCategorias();
    fetchBrands();
  }, []);

  // Nota: Ya no necesitamos 'indexOfLastProduct', 'indexOfFirstProduct' ni 'currentProducts'
  // porque el array 'products' ya contiene los elementos correctos para la página.

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Productos</h1>
        </div>

        <div className={styles.toolsContainer}>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <Filters
            categories={categories}
            brands={brands}
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {/* Mostrar información basada en los datos del servidor */}
        <div className={styles.resultsInfo}>
          <span>
            Mostrando {products.length} de {totalProducts} productos
          </span>
        </div>

        {isLoading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className={styles.productsGrid}>
            {/* Usar 'products' directamente, que son los 12 traídos por Supabase */}
            {products.map((product) => (
              <ProductCard key={product.id} producto={product} />
            ))}
          </div>
        )}

        {/* Usar 'totalProducts' (el conteo del servidor) para la paginación */}
        {totalProducts > productsPerPage && (
          <Pagination
            productsPerPage={productsPerPage}
            totalProducts={totalProducts} // Usamos el conteo total filtrado por el servidor
            currentPage={currentPage}
            paginate={paginate}
          />
        )}
      </div>
    </div>
  );
}