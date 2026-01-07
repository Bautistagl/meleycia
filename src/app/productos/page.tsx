"use client";

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
  precio_oferta?: number;
  stock?: number;
  [key: string]: any;
};

interface FiltersState {
  category: string;
  brand: string;
  inStockOnly: boolean;
}

type CurrentView = "productos" | "ofertas";

type DisplayItem =
  | (Producto & { __type: "producto" })
  | (Combo & { __type: "combo" });

export default function ProductsPage() {
  const [currentView, setCurrentView] = useState<CurrentView>("productos");
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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

  const [brands, setBrands] = useState<
    { id: string | number; marca: string }[]
  >([]);

  const [categories, setCategories] = useState<
    { id: string | number; nombre: string }[]
  >([]);

  const normalize = (v: string) =>
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const buildSearchVariants = (term: string) => {
    const raw = term.trim();
    const normalized = normalize(raw);
    return raw === normalized ? [raw] : [raw, normalized];
  };

  const detectBrandFromSearch = (term: string) => {
    if (!term) return "";
    const nTerm = normalize(term);
    const match = brands.find((b) => normalize(b.marca) === nTerm);
    return match ? match.marca : "";
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchData = useCallback(
    async (view: CurrentView) => {
      setIsLoading(true);

      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      if (view === "productos") {
        let query = supabase
          .from("productos")
          .select("*", { count: "exact" })
          .order(ORDER_BY_COLUMN, { ascending: false });

        const detectedBrand = detectBrandFromSearch(debouncedSearchTerm);

        if (detectedBrand) {
          query = query.eq("marca", detectedBrand);
        } else if (debouncedSearchTerm) {
          const variants = buildSearchVariants(debouncedSearchTerm);

          const orParts: string[] = [];
          variants.forEach((v) => {
            const safe = v.replace(/,/g, "");
            orParts.push(
              `nombre.ilike.%${safe}%`,
              `descripcion.ilike.%${safe}%`,
              `codigo.ilike.%${safe}%`
            );
          });

          query = query.or(orParts.join(","));
        }

        if (filters.inStockOnly) query = query.gt("stock", 0);
        if (filters.category)
          query = query.ilike("categoria", `%${filters.category}%`);
        if (filters.brand) query = query.ilike("marca", `%${filters.brand}%`);

        const { data, count } = await query.range(from, to);

        setItems((data || []).map((p) => ({ ...p, __type: "producto" })));
        setTotalItems(count || 0);
        setIsLoading(false);
        return;
      }

      const [prodRes, comboRes] = await Promise.all([
        supabase.from("productos").select("*").gt("precio_oferta", 0),
        supabase.from("combos").select("*"),
      ]);

      let merged: DisplayItem[] = [
        ...(prodRes.data || []).map((p) => ({ ...p, __type: "producto" })),
        ...(comboRes.data || []).map((c) => ({ ...c, __type: "combo" })),
      ];

      if (debouncedSearchTerm) {
        const variants = buildSearchVariants(debouncedSearchTerm);
        merged = merged.filter((i) =>
          variants.some((v) =>
            normalize(
              `${i.nombre ?? ""} ${i.descripcion ?? ""} ${i.codigo ?? ""}`
            ).includes(normalize(v))
          )
        );
      }

      if (filters.inStockOnly) {
        merged = merged.filter((i) => Number(i.stock) > 0);
      }

      setItems(merged.slice(from, to + 1));
      setTotalItems(merged.length);
      setIsLoading(false);
    },
    [currentPage, debouncedSearchTerm, filters, brands, productsPerPage]
  );

  useEffect(() => {
    const viewParam = searchParams.get("view");
    const finalView: CurrentView =
      viewParam === "ofertas" ? "ofertas" : "productos";
    setCurrentView(finalView);
  }, [searchParams]);

  useEffect(() => {
    fetchData(currentView);
  }, [currentView, fetchData]);

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
  }, [debouncedSearchTerm, filters, currentView]);

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

  const changeView = (view: CurrentView) => {
    if (view === currentView) return;

    setCurrentPage(1);
    setSearchTerm("");
    setFilters({
      category: "",
      brand: "",
      inStockOnly: false,
    });

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
  };

  useEffect(() => {
    const mailCliente = localStorage.getItem("meleyciamail");
    if (mailCliente === "meleycia@admin.com") setAdmin(true);
  }, []);

  const paginate = (page: number) => setCurrentPage(page);

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
            />
            <label htmlFor="inStockOnly">Solo en Stock</label>
          </div>

          {currentView === "productos" && (
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
            Mostrando {items.length} de {totalItems} {currentView}
          </span>
        </div>

        {isLoading ? (
          <p>Cargando {currentView}...</p>
        ) : (
          <div className={styles.productsGrid}>
            {items.map((item) => (
              <ProductCard
                key={`${item.__type}-${item.id}`}
                admin={admin}
                isCombo={item.__type === "combo"}
                producto={item as Producto}
              />
            ))}
          </div>
        )}

        {items.length === 0 && (
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
