"use client"

import { useState, useEffect } from "react"
import { Search } from "./components/Search"
import { Filters } from "./components/Filters"
import { ProductCard } from "./components/ProductCard"
import { Pagination } from "./components/Pagination"
import styles from "./products.module.css"
import type { Product } from "./types"
import Navbar from "../components/landing/Navbar"
import { supabase } from "@/lib/supabase"
import { Producto } from "@/types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
  })

  const productsPerPage = 12

  
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
  fetchProductos()
   
  }, [])

  // Filter products based on search term and filters
  useEffect(() => {
    let result = [...products]
  if (searchTerm) {
    result = result.filter(
      (product) =>
        (product.nombre ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }

    if (filters.category) {
      result = result.filter((product) => product.categoria === filters.category)
    }

    if (filters.brand) {
      result = result.filter((product) => product.marca === filters.brand)
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, filters, products])

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Get unique categories and brands for filters
  const categories = [...new Set(products.map((product) => product.categoria))]
  const brands = [...new Set(products.map((product) => product.marca))]

  return (
    <div>

        <Navbar />
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Productos</h1>
      </div>

      <div className={styles.toolsContainer}>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Filters categories={categories} brands={brands} filters={filters} setFilters={setFilters} />
      </div>

      <div className={styles.resultsInfo}>
        <span>
          Mostrando {currentProducts.length} de {filteredProducts.length} productos
        </span>
      </div>

      <div className={styles.productsGrid}>
        {currentProducts.map((product) => (
          <ProductCard key={product.id} producto={product} />
        ))}
      </div>

      {filteredProducts.length > productsPerPage && (
        <Pagination
          productsPerPage={productsPerPage}
          totalProducts={filteredProducts.length}
          currentPage={currentPage}
          paginate={paginate}
        />
      )}
    </div>
    </div>
  )
}
