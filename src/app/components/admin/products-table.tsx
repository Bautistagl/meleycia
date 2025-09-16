'use client'

import { useEffect, useState } from "react";
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
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
  });

  // Get unique categories and brands for filters
  const categories = [...new Set(products.map((product) => product.categoria))];
  const brands = [...new Set(products.map((product) => product.marca))];

  // Fetch all products once on mount
  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase.from("productos").select("*");
      if (error) {
        console.error("Error fetching productos:", error.message);
        return;
      }

      setProducts(data);
      setFilteredProducts(data);
    };
    fetchProductos();
  }, []);

  // Filter products based on search term and filters
  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(
        (product) =>
          (product.nombre ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.description ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter(
        (product) => product.categoria === filters.category
      );
    }

    if (filters.brand) {
      result = result.filter((product) => product.marca === filters.brand);
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, products]);

  // Pagination logic
  const indexOfLastProduct = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.search}>
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
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>{product.marca}</td>
                <td>${formatMoney(product.precio)}</td>
                <td>{product.codigo}</td>
                <td>
                  <div className={styles.actions}>
                    <Link
                      href={`/admin/productos/${product.id}/edit`}
                      className={styles.editButton}
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteConfirmDialog id={product.id} name={product.nombre}>
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
        {filteredProducts.length > ITEMS_PER_PAGE && (
          <Pagination
            productsPerPage={ITEMS_PER_PAGE}
            totalProducts={filteredProducts.length}
            currentPage={currentPage}
            paginate={paginate}
          />
        )}
      </div>
    </div>
  );
}