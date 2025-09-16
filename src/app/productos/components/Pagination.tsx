"use client"

import styles from "./Pagination.module.css"

interface PaginationProps {
  productsPerPage: number
  totalProducts: number
  currentPage: number
  paginate: (pageNumber: number) => void
}

export function Pagination({ productsPerPage, totalProducts, currentPage, paginate }: PaginationProps) {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const maxPagesToShow = 10; // Puedes ajustar este número

  // Lógica para generar los números de página visibles
  let startPage, endPage;
  if (totalPages <= maxPagesToShow) {
    // Si el total de páginas es menor que el límite, muestra todas
    startPage = 1;
    endPage = totalPages;
  } else {
    // Si hay más páginas, calcula el rango dinámico
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      // Si la página actual está cerca del inicio
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // Si la página actual está cerca del final
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      // Si la página actual está en el medio
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  // Genera el array de números de página
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Comprueba si se necesitan puntos suspensivos
  const showEllipsisStart = startPage > 1;
  const showEllipsisEnd = endPage < totalPages;

  return (
    <div className={styles.paginationContainer}>
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageButton}
      >
        &laquo; Anterior
      </button>

      <div className={styles.pageNumbers}>
        {/* Muestra el primer número y los puntos suspensivos si es necesario */}
        {showEllipsisStart && (
          <>
            <button onClick={() => paginate(1)} className={styles.pageNumber}>
              1
            </button>
            <span className={styles.ellipsis}>...</span>
          </>
        )}

        {/* Muestra los números de página calculados */}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`${styles.pageNumber} ${
              currentPage === number ? styles.active : ""
            }`}
          >
            {number}
          </button>
        ))}

        {/* Muestra los puntos suspensivos y el último número si es necesario */}
        {showEllipsisEnd && (
          <>
            <span className={styles.ellipsis}>...</span>
            <button
              onClick={() => paginate(totalPages)}
              className={styles.pageNumber}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.pageButton}
      >
        Siguiente &raquo;
      </button>
    </div>
  );
}