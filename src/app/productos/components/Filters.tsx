"use client"

import type { ChangeEvent } from "react"
import styles from "./Filters.module.css"

interface FiltersProps {
  categories: { id: string | number; nombre: string }[];
  brands: { id: string | number; marca: string }[];
  filters: {
    category: string;
    brand: string;
    inStockOnly: boolean;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      category: string;
      brand: string;
      inStockOnly: boolean;
    }>
  >;
}

export function Filters({
  categories,
  brands,
  filters,
  setFilters,
}: FiltersProps) {
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const handleBrandChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      brand: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      inStockOnly: false,
    });
  };

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
          value={filters.brand.toLowerCase()}
          onChange={(e) => {
            const normalized = e.target.value.toLowerCase();
            handleBrandChange(normalized);
          }}
          className={styles.select}
        >
          <option value="">Todas</option>

          {[...brands]
            .sort((a, b) => a.marca.localeCompare(b.marca))
            .map((brand) => {
              const normalized = brand.marca.toLowerCase();
              return (
                <option key={brand.id} value={normalized}>
                  {brand.marca.toUpperCase()}
                </option>
              );
            })}
        </select>
      </div>

      <button
        onClick={clearFilters}
        className={styles.clearButton}
        disabled={!filters.category && !filters.brand && !filters.inStockOnly}
      >
        Limpiar filtros
      </button>
    </div>
  );
}
