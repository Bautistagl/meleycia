"use client"

import type { ChangeEvent } from "react"
import styles from "./Filters.module.css"


// 1. Actualizar la interfaz FiltersProps para incluir inStockOnly
interface FiltersProps {
  // Las props ahora esperan el nuevo formato de array de objetos
  categories: { id: string | number; nombre: string }[]
  brands: { id: string | number; marca: string }[]
  filters: {
    category: string
    brand: string
    inStockOnly: boolean // 🆕 Propiedad de stock añadida
  }
  setFilters: (filters: { 
      category: string; 
      brand: string;
      inStockOnly: boolean // 🆕 Propiedad de stock añadida
    }) => void
}

export function Filters({ categories, brands, filters, setFilters }: FiltersProps) {
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // Al actualizar, se pasa el objeto filters completo
    setFilters({ ...filters, category: e.target.value })
  }

  const handleBrandChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // Al actualizar, se pasa el objeto filters completo
    setFilters({ ...filters, brand: e.target.value })
  }

  const clearFilters = () => {
    // 2. Resetear todos los filtros a sus valores iniciales (cadenas vacías y false)
    setFilters({ category: "", brand: "", inStockOnly: false }) 
  }

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <label htmlFor="category">Categoría:</label>
        <select 
          id="category" 
          value={filters.category} 
          onChange={handleCategoryChange} 
          className={styles.select}
        >
          <option value="">Todas</option>
          {/* Uso del nuevo estado de categorías: key={category.id}, value={category.nombre} */}
          {categories.map((category) => (
            <option key={category.id} value={category.nombre}> 
              {category.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="brand">Marca:</label>
<select 
  id="brand" 
  value={filters.brand} 
  onChange={handleBrandChange} 
  className={styles.select}
>
  {/* La opción "Todas" siempre va primero */}
  <option value="">Todas</option>
  
  {[...brands] // 1. Crea una copia de la matriz.
    .sort((a, b) => a.marca.localeCompare(b.marca)) // 2. Ordena alfabéticamente (ya es case-insensitive por defecto).
    .map((brand) => (
      <option key={brand.id} value={brand.marca}>
        {/* 3. Muestra el texto en MAYÚSCULAS para el usuario */}
        {brand.marca.toUpperCase()} 
      </option>
    ))}
</select>
      </div>

      <button 
        onClick={clearFilters} 
        className={styles.clearButton} 
        // 3. Deshabilitar si no hay filtros aplicados (categoría, marca o stock)
        disabled={!filters.category && !filters.brand && !filters.inStockOnly}
      >
        Limpiar filtros
      </button>
    </div>
  )
}