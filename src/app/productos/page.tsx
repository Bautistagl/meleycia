"use client"

import { useState, useEffect, useCallback } from "react";
import { Search } from "./components/Search";
import { Filters } from "./components/Filters";
// ProductCard puede necesitar un prop para distinguir si es producto o combo,
// o si la estructura de Combo es diferente, necesitarás un ComboCard.
// Asumiré que ProductCard puede manejar el tipo Combo o crearé un tipo genérico para el mapeo.
import { ProductCard } from "./components/ProductCard";
import { Pagination } from "./components/Pagination";
import styles from "./products.module.css";
import Navbar from "../components/landing/Navbar";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/types";

// 1. Definir un tipo para Combo (ajusta esto a tu estructura real de la base de datos)
// Asumiré que Combo es similar a Producto para usar el mismo ProductCard por ahora.
// Si son muy distintos, deberás crear un <ComboCard />.
type Combo = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  // Otros campos específicos de Combo
  [key: string]: any;
};

// 2. Definir un tipo genérico que pueda ser Producto o Combo para el mapeo
// Esto solo si la tarjeta es muy genérica. Si no, usa el tipo específico.
// Para simplificar, asumiremos que ProductCard manejará ambos o que Combo tiene los campos base necesarios.
type DisplayItem = Producto | Combo;

// 3. Nuevo estado para controlar la vista: 'productos' o 'combos'
type CurrentView = "productos" | "combos";

export default function ProductsPage() {
  const [currentView, setCurrentView] = useState<CurrentView>("productos"); // Estado de la vista

  const [products, setProducts] = useState<Producto[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]); // Nuevo estado para combos

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
  });
  const [admin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Total de items que cumplen los filtros para la vista actual
  const [totalItems, setTotalItems] = useState(0); 

  const productsPerPage = 12;
  const ORDER_BY_COLUMN = "id";

  // Función para cambiar la vista (Productos/Combos)
  const changeView = (view: CurrentView) => {
    // Si la vista ya es la actual, no hacemos nada
    if (view === currentView) return; 

    // 🔴 Importante: Siempre volver a la página 1 y limpiar el total cuando se cambia de vista
    setCurrentPage(1); 
    setTotalItems(0); 
    setSearchTerm(""); // Opcional: limpiar búsqueda
    setFilters({ category: "", brand: "" }); // Opcional: limpiar filtros
    setCurrentView(view);
  };

  // 4. Función de fetch unificada (para Productos y Combos)
  const fetchData = useCallback(async (view: CurrentView) => {
    setIsLoading(true);

    const from = (currentPage - 1) * productsPerPage;
    const to = from + productsPerPage - 1;

    // Determinar la tabla y las funciones de estado a usar
    const isProductsView = view === "productos";
    const tableName = isProductsView ? "productos" : "combos"; // <-- Usa el nombre correcto de tu tabla de combos
    const setStateFunc = isProductsView ? setProducts : setCombos;

    let query = supabase
      .from(tableName)
      .select("*", { count: "exact" })
      .order(ORDER_BY_COLUMN, { ascending: false });

    // Aplicar filtros de texto (nombre y descripción)
    if (searchTerm) {
      query = query.or(
        `nombre.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`
      );
    }
    
    // ⚠️ Nota: Los filtros de categoría/marca pueden no ser aplicables a Combos. 
    // Considera limpiar o deshabilitar estos filtros si estás en la vista 'combos'.
    if (isProductsView) {
      if (filters.category) {
        query = query.eq("categoria", filters.category);
      }
      if (filters.brand) {
        query = query.eq("marca", filters.brand);
      }
    }
    
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error(`Error fetching ${tableName}:`, error.message);
      setIsLoading(false);
      return;
    }

    if (isProductsView) {
      setProducts(data as Producto[] || []);
    } else {
      setCombos(data as Combo[] || []);
    }
    setTotalItems(count || 0); // Actualiza el total de la vista actual
    setIsLoading(false);
  }, [currentPage, searchTerm, filters, currentView]); // 🔴 Agregamos currentView como dependencia

  useEffect(() => {
    // Cuando cambian la vista, filtros, o la página, recargamos los datos
    fetchData(currentView);
  }, [fetchData]);

  useEffect(() => {
    // Si cambia el término de búsqueda o filtros, siempre volvemos a la página 1.
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, filters]);
  
  // Lógica de fetch de Marcas y Categorías (no se modifica, pero recuerda que solo aplican a Productos)
  // ... (tu código para fetchBrands y fetchCategorias)
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

  useEffect(() => {
    const mailCliente = localStorage.getItem("meleyciamail");
    if (mailCliente == "meleycia@admin.com") {
      setAdmin(true);
    }
  }, []);
  
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Determinar los items a mostrar y la cantidad actual
  const itemsToDisplay = currentView === "productos" ? products : combos;
  const currentItemCount = itemsToDisplay.length;

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        {/* 6. Modificación del Header para incluir botones clickeables */}
        <div className={styles.header}>
          {/* Estilos sencillos para que se vea la diferencia, ajústalos con CSS */}
          <button 
            onClick={() => changeView("productos")} 
            className={`${styles.headerButton} ${currentView === "productos" ? styles.active : ''}`}

          >
            <h1>Productos</h1>
          </button>
       
          <button 
            onClick={() => changeView("combos")} 
            className={`${styles.headerButton} ${currentView === "combos" ? styles.active : ''}`}

          >
            <h1>Combos</h1>
          </button>
        </div>

        <div className={styles.toolsContainer}>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {/* ⚠️ Nota: Los filtros de categoría/marca sólo tienen sentido para 'productos' */}
          {currentView === "productos" && (
            <Filters
              categories={categories}
              brands={brands}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        </div>

        {/* Mostrar información basada en los datos del servidor */}
        <div className={styles.resultsInfo}>
          <span>
            Mostrando {currentItemCount} de {totalItems} {currentView}
          </span>
        </div>

        {isLoading ? (
          <p>Cargando {currentView}...</p>
        ) : (
          <div className={styles.productsGrid}>
            {/* 7. Mapear 'itemsToDisplay' (que será products o combos) */}
            {itemsToDisplay.length > 0 ? (
                itemsToDisplay.map((item) => (
                    // Asegúrate de que ProductCard pueda aceptar tanto Producto como Combo
                    <ProductCard key={item.id} admin={admin} isCombo={currentView === 'combos'} producto={item as Producto} />
                ))
            ) : (
                <p>No se encontraron {currentView} que coincidan con los criterios de búsqueda.</p>
            )}
          </div>
        )}

        {/* Usar 'totalItems' para la paginación */}
        {totalItems > productsPerPage && (
          <Pagination
            productsPerPage={productsPerPage}
            totalProducts={totalItems} // Usamos el conteo total filtrado
            currentPage={currentPage}
            paginate={paginate}
          />
        )}
      </div>
    </div>
  );
}
// Deberías añadir los estilos CSS para .headerButton y .active en tu archivo products.module.css