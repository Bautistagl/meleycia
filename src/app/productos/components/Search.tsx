"use client"

import type { ChangeEvent } from "react"
import styles from "./Search.module.css"

interface SearchProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function Search({ searchTerm, setSearchTerm }: SearchProps) {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={handleSearch}
        className={styles.searchInput}
      />
      <button className={styles.searchButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  )
}
