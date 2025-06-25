"use client"

import type { ChangeEvent } from "react"
import styles from "./Filters.module.css"

interface FiltersProps {
  categories: string[]
  brands: string[]
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
        <select id="category" value={filters.category} onChange={handleCategoryChange} className={styles.select}>
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="brand">Marca:</label>
        <select id="brand" value={filters.brand} onChange={handleBrandChange} className={styles.select}>
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
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
