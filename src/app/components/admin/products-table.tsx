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
import { useRouter, useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 7;
const ORDER_BY_COLUMN = "id";

const formatMoney = (value: number | null): string => {
  if (value === null || isNaN(value)) return "";
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function ProductsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // CORREGIDO: SIEMPRE USAR searchParams.get(...)
  const initialPage = Number(searchParams.get("page") ?? 1);
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "";
  const initialBrand = searchParams.get("brand") ?? "";
  const initialStock = searchParams.get("inStock") === "true";

  const [products, setProducts] = useState<Producto[]>([]);
  const [brands, setBrands] = useState<
    { id: string | number; marca: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { id: string | number; nombre: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({
    category: initialCategory,
    brand: initialBrand,
    inStockOnly: initialStock,
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateUrl = (changes = {}) => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      search: searchTerm,
      category: filters.category,
      brand: filters.brand,
      inStock: filters.inStockOnly ? "true" : "false",
      ...changes,
    });

    router.replace(`/admin/productos?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase.from("marcas").select("id, marca");
      setBrands(data || []);
    };

    const fetchCategorias = async () => {
      const { data } = await supabase.from("categorias").select("id, nombre");
      setCategories(data || []);
    };

    fetchCategorias();
    fetchBrands();
  }, []);

  const fetchProductos = useCallback(async () => {
    setIsLoading(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("productos")
      .select("*", { count: "exact" })
      .order(ORDER_BY_COLUMN, { ascending: false });

    if (searchTerm) {
      query = query.or(
        `nombre.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`
      );
    }

    if (filters.category) query = query.eq("categoria", filters.category);
    if (filters.brand) query = query.eq("marca", filters.brand);
    if (filters.inStockOnly) query = query.gt("stock", 0);

    const { data, count } = await query.range(from, to);

    setProducts(data || []);
    setTotalProducts(count || 0);
    setIsLoading(false);
  }, [currentPage, searchTerm, filters]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      updateUrl({ page: "1" });
    }
  }, [filters, searchTerm]);
  useEffect(() => {
    updateUrl();
  }, [currentPage, searchTerm, filters]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    updateUrl({ page: pageNumber.toString() });
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

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
            {isLoading && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Cargando productos...
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
                      <Link
                        href={`/admin/productos/${
                          product.id
                        }/edit?${new URLSearchParams({
                          page: currentPage.toString(),
                          search: searchTerm,
                          category: filters.category,
                          brand: filters.brand,
                          inStock: filters.inStockOnly ? "true" : "false",
                        }).toString()}`}
                        className={styles.editButton}
                      >
                        <Edit size={16} />
                      </Link>

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
