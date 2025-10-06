"use client"

import type { ChangeEvent } from "react"
import styles from "./Filters.module.css"




interface FiltersProps {
  // Las props ahora esperan el nuevo formato de array de objetos
  categories: { id: string | number; nombre: string }[]
  brands: { id: string | number; marca: string }[]
  filters: {
    category: string
    brand: string
  }
  setFilters: (filters: { category: string; brand: string }) => void
}

export function Filters({ categories, brands, filters, setFilters }: FiltersProps) {
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, category: e.target.value })
  }

  const handleBrandChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, brand: e.target.value })
  }

  const clearFilters = () => {
    setFilters({ category: "", brand: "" })
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
          <option value="">Todas</option>
          {/* Uso del nuevo estado de marcas: key={brand.id}, value={brand.marca} */}
          {brands.map((brand) => (
            <option key={brand.id} value={brand.marca}>
              {brand.marca}
            </option>
          ))}
        </select>
      </div>

      <button onClick={clearFilters} className={styles.clearButton} disabled={!filters.category && !filters.brand}>
        Limpiar filtros
      </button>
    </div>
  )
}