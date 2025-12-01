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
import { useSearchParams, useRouter } from "next/navigation";

type Combo = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  [key: string]: any;
};

interface FiltersState {
  category: string;
  brand: string;
  inStockOnly: boolean;
}

type DisplayItem = Producto | Combo;
type CurrentView = "productos" | "combos" | "ofertas";

function normalizeTerm(term: string) {
  let t = term.toLowerCase().trim();

  if (t.endsWith("es")) t = t.slice(0, -2);
  else if (t.endsWith("s")) t = t.slice(0, -1);

  if (/[aeiou]$/.test(t)) t = t.slice(0, -1);

  return t;
}

export default function ProductsPage() {
  const [currentView, setCurrentView] = useState<CurrentView>("productos");

  const [products, setProducts] = useState<Producto[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [brandDetected, setBrandDetected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    category: "",
    brand: "",
    inStockOnly: false,
  });

  const [admin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  const productsPerPage = 12;
  const ORDER_BY_COLUMN = "id";

  const hasActiveFilters =
    filters.category !== "" ||
    filters.brand !== "" ||
    filters.inStockOnly === true;

  const fetchData = useCallback(
    async (view: CurrentView) => {
      setIsLoading(true);

      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      let tableName = "productos";
      if (view === "combos") tableName = "combos";

      let query = supabase
        .from(tableName)
        .select("*", { count: "exact" })
        .order(ORDER_BY_COLUMN, { ascending: false });

      if (view === "ofertas") {
        query = query.gt("precio_oferta", 0);
      }

      // Sólo aplicar búsqueda por texto si NO se detectó marca automáticamente
      if (searchTerm && !brandDetected) {
        const stem = normalizeTerm(searchTerm);
        query = query.or(
          `nombre.ilike.%${stem}%,descripcion.ilike.%${stem}%,codigo.ilike.%${stem}%`
        );
      }

      if (filters.inStockOnly) {
        query = query.gt("stock", 0);
      }

      if (view !== "combos") {
        if (filters.category)
          query = query.ilike("categoria", `%${filters.category}%`);
        // usar patrón % para que ilike funcione como contains
        if (filters.brand) query = query.ilike("marca", `%${filters.brand}%`);
      }

      const { data, error, count } = await query.range(from, to);

      if (!error) {
        if (view === "combos") setCombos(data as Combo[]);
        else setProducts(data as Producto[]);
        setTotalItems(count || 0);
      }

      setIsLoading(false);
    },
    [currentPage, searchTerm, filters, brandDetected]
  );

  useEffect(() => {
    const viewParam = searchParams.get("view");
    const finalView =
      viewParam === "productos" ||
      viewParam === "combos" ||
      viewParam === "ofertas"
        ? (viewParam as CurrentView)
        : "productos";

    setCurrentView(finalView);
    fetchData(finalView);
  }, [searchParams, fetchData]);

  useEffect(() => {
    const brandParam = searchParams.get("brand") || "";
    const categoryParam = searchParams.get("category") || "";

    setFilters((prev) => ({
      ...prev,
      brand: brandParam,
      category: categoryParam,
    }));
  }, [searchParams]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, filters]);

  const [brands, setBrands] = useState<
    { id: string | number; marca: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { id: string | number; nombre: string }[]
  >([]);

  useEffect(() => {
    supabase
      .from("marcas")
      .select("id, marca")
      .then(({ data }) => data && setBrands(data));
    supabase
      .from("categorias")
      .select("id, nombre")
      .then(({ data }) => data && setCategories(data));
  }, []);
  useEffect(() => {
    if (brands.length === 0) return;

    // Si el campo de búsqueda está vacío, resetear detección automática (pero mantener filtro manual)
    if (!searchTerm) {
      setBrandDetected(false);
      return;
    }

    const handler = setTimeout(() => {
      const term = normalizeTerm(searchTerm);

      // Preferir coincidencia exacta en normalized; si no, permitir startsWith para coincidencias parciales.
      const matchedBrand = brands.find((b) => {
        const n = normalizeTerm(b.marca);
        return n === term || n.startsWith(term);
      });

      if (matchedBrand) {
        // Activa el filtro de marca detectado automáticamente
        setFilters((prev) => ({
          ...prev,
          brand: matchedBrand.marca,
        }));
        setBrandDetected(true);
        // NO limpiamos searchTerm para evitar efectos secundarios y confusión
      } else {
        // Si ya había sido detectada una marca pero ahora el término no coincide, desactivar el flag
        setBrandDetected(false);
      }
    }, 600); // debounce 600ms (ajustable)

    return () => clearTimeout(handler);
  }, [searchTerm, brands]);

  // --- Resetear brandDetected si el usuario borra el filtro de marca manualmente ---
  useEffect(() => {
    if (!filters.brand) setBrandDetected(false);
  }, [filters.brand]);

  // --- Asegurarse de limpiar brandDetected al cambiar view o limpiar filtros ---
  const changeView = (view: CurrentView) => {
    if (view === currentView) return;

    setCurrentPage(1);
    setTotalItems(0);
    setSearchTerm("");
    setFilters((prev) => ({
      category: "",
      brand: "",
      inStockOnly: prev.inStockOnly,
    }));
    setBrandDetected(false);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("view", view);
    router.push(`/productos?${newSearchParams.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      inStockOnly: false,
    });
    setBrandDetected(false);
  };
  useEffect(() => {
    const mailCliente = localStorage.getItem("meleyciamail");
    if (mailCliente == "meleycia@admin.com") setAdmin(true);
  }, []);

  const paginate = (page: number) => setCurrentPage(page);

  const itemsToDisplay =
    currentView === "productos"
      ? products
      : currentView === "combos"
      ? combos
      : products;

  const currentItemCount = itemsToDisplay.length;

  return (
    <div>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <button
            onClick={() => changeView("productos")}
            className={`${styles.headerButton} ${
              currentView === "productos" ? styles.active : ""
            }`}
          >
            <h1>Productos</h1>
          </button>

          <button
            onClick={() => changeView("combos")}
            className={`${styles.headerButton} ${
              currentView === "combos" ? styles.active : ""
            }`}
          >
            <h1>Combos</h1>
          </button>

          <button
            onClick={() => changeView("ofertas")}
            className={`${styles.headerButton} ${
              currentView === "ofertas" ? styles.active : ""
            }`}
          >
            <h1>Ofertas</h1>
          </button>
        </div>

        <div className={styles.toolsContainer}>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className={`${styles.filterItem} ${styles.stockFilter}`}>
            <input
              id="inStockOnly"
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  inStockOnly: e.target.checked,
                }))
              }
              style={{ marginRight: "8px", transform: "scale(1.2)" }}
            />
            <label htmlFor="inStockOnly" style={{ whiteSpace: "nowrap" }}>
              Solo en Stock
            </label>
          </div>

          {currentView !== "combos" && (
            <Filters
              categories={categories}
              brands={brands}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        </div>

        <div className={styles.resultsInfo}>
          <span>
            Mostrando {currentItemCount} de {totalItems} {currentView}
          </span>
        </div>

        {isLoading ? (
          <p>Cargando {currentView}...</p>
        ) : (
          <div className={styles.productsGrid}>
            {itemsToDisplay.length > 0
              ? itemsToDisplay.map((item) => (
                  <ProductCard
                    key={item.id}
                    admin={admin}
                    isCombo={currentView === "combos"}
                    producto={item as Producto}
                  />
                ))
              : ""}
          </div>
        )}

        {itemsToDisplay.length === 0 && (
          <div className={styles.noResultsBox}>
            {hasActiveFilters ? (
              <div>
                <p className={styles.active}>
                  No hay resultados con los filtros aplicados.
                </p>
                <button
                  onClick={clearFilters}
                  className={styles.clearFiltersBtn}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <p>No se encontraron resultados.</p>
            )}
          </div>
        )}

        {totalItems > productsPerPage && (
          <Pagination
            productsPerPage={productsPerPage}
            totalProducts={totalItems}
            currentPage={currentPage}
            paginate={paginate}
          />
        )}
      </div>
    </div>
  );
}


// Deberías añadir los estilos CSS para .headerButton y .active en tu archivo products.module.css