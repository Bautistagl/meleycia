"use client"

import styles from "./Pagination.module.css"

interface PaginationProps {
  productsPerPage: number
  totalProducts: number
  currentPage: number
  paginate: (pageNumber: number) => void
}

export function Pagination({ productsPerPage, totalProducts, currentPage, paginate }: PaginationProps) {
  const pageNumbers = []

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i)
  }

  return (
    <div className={styles.paginationContainer}>
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={styles.pageButton}>
        &laquo; Anterior
      </button>

      <div className={styles.pageNumbers}>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`${styles.pageNumber} ${currentPage === number ? styles.active : ""}`}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === pageNumbers.length}
        className={styles.pageButton}
      >
        Siguiente &raquo;
      </button>
    </div>
  )
}
