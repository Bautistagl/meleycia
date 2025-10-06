"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./products-table.module.css";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/types";
import { Search } from "@/app/productos/components/Search";
import { Filters } from "@/app/productos/components/Filters";
import { Pagination } from "@/app/productos/components/Pagination";

const ITEMS_PER_PAGE = 7;
// Columna para ordenar por el más reciente (ID o fecha de creación)
const ORDER_BY_COLUMN = "id";

// Definición de tipos para Marcas y Categorías
interface FilterOption {
  id: string | number;
  nombre: string;
}

// Función auxiliar para formatear un número a formato de moneda (ej: 2.343,33)
const formatMoney = (value: number | null): string => {
  if (value === null || isNaN(value)) {
    return "";
  }
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function ProductsTable() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [brands, setBrands] = useState<
    { id: string | number; marca: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { id: string | number; nombre: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Fetch de Marcas y Categorías (Solo los nombres para la lista de filtros) ---
  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase.from("marcas").select("id, marca");
      if (error) {
        console.error("Error fetching brands:", error.message);
        return;
      }
      // ¡CORRECCIÓN AQUÍ! Solo llamas a setBrands una vez con el array de objetos.
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
      // ¡CORRECCIÓN AQUÍ! Solo llamas a setCategorias una vez con el array de objetos.
      setCategories(data as { id: string | number; nombre: string }[]);
    };

    fetchCategorias();
    fetchBrands();
  }, []);

  // --- 2. Fetch de Productos (Paginación y Filtrado en Supabase) ---
  const fetchProductos = useCallback(async () => {
    setIsLoading(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Iniciar la consulta, solicitando el conteo exacto de filas
    let query = supabase
      .from("productos")
      .select("*", { count: "exact" })
      .order(ORDER_BY_COLUMN, { ascending: false });

    // Aplicar filtros de texto (nombre y descripción) usando .or() e .ilike()
    if (searchTerm) {
      // La sintaxis de PostgREST para OR es: .or('col1.ilike.%val%,col2.ilike.%val%')
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

    setProducts(data || []);
    setTotalProducts(count || 0);
    setIsLoading(false);
  }, [currentPage, searchTerm, filters]); // Dependencias: la consulta cambia con estos estados

  // Ejecuta la función de carga cuando cambia la página, la búsqueda o los filtros
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Resetear la página a 1 cuando la búsqueda o los filtros cambian
  // NOTA: Esto debe ejecutarse antes de que fetchProductos use el nuevo searchTerm/filters
  useEffect(() => {
    // Solo resetea si el cambio no es solo en la página
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchProductos(); // Forzar la recarga si ya estamos en la página 1
    }
  }, [searchTerm, filters]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.search}>
          {/* El componente Search ahora cambia el estado searchTerm, que dispara la consulta */}
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <Filters
          categories={categories}
          brands={brands}
          filters={filters}
          setFilters={setFilters}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Codigo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Cargando productos... 🔄
                </td>
              </tr>
            )}
            {!isLoading && products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No se encontraron productos que coincidan con los filtros.
                </td>
              </tr>
            )}
            {!isLoading &&
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.nombre}</td>
                  <td>{product.categoria}</td>
                  <td>{product.marca}</td>
                  <td>${formatMoney(product.precio)}</td>
                  <td>{product.codigo}</td>
                  <td>
                    <div className={styles.actions}>
                      {/* Botón de Editar reincorporado */}
                      <Link
                        href={`/admin/productos/${product.id}/edit`}
                        className={styles.editButton}
                      >
                        <Edit size={16} />
                      </Link>
                      {/* Botón de Eliminar reincorporado */}
                      <DeleteConfirmDialog
                        id={product.id}
                        name={product.nombre}
                      >
                        <button className={styles.deleteButton}>
                          <Trash2 size={16} />
                        </button>
                      </DeleteConfirmDialog>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        {totalPages > 1 && (
          <Pagination
            productsPerPage={ITEMS_PER_PAGE}
            totalProducts={totalProducts}
            currentPage={currentPage}
            paginate={paginate}
          />
        )}
      </div>
    </div>
  );
}
