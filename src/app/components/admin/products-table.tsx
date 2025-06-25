'use client'

import { useEffect, useState } from "react";
import styles from "./products-table.module.css";
import { Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/types";

const ITEMS_PER_PAGE = 7;

export function ProductsTable() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const [{ data, error }, { count }] = await Promise.all([
        supabase
          .from("productos")
          .select(
            "id, nombre, categoria, precio, stock, created_at, descripcion, marca, precio_oferta, imageUrl",
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to),
        supabase.from("productos").select("*", { count: "exact", head: true }),
      ]);

      if (!error && data) {
        const mapped = data.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precio: p.precio,
          stock: p.stock,
          description: p.descripcion,
          marca: p.marca,
          imageUrl: p.imageUrl,
          precio_oferta: p.precio_oferta,
        }));
        setProducts(mapped);
        setTotalPages(Math.ceil((count ?? 0) / ITEMS_PER_PAGE));
      }
    }

    fetchProducts();
  }, [page]);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.search}>
          <Search className={styles.searchIcon} size={16} />
          <input
            type="text"
            placeholder="Buscar productos..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Stock</th>

              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>${product.precio.toFixed(2)}</td>
                <td>{product.stock}</td>

                <td>
                  <div className={styles.actions}>
                    <Link
                      href={`/admin/productos/${product.id}/edit`}
                      className={styles.editButton}
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteConfirmDialog id={product.id} name={product.nombre}>
                      <button className={styles.deleteButton}>
                        <Trash2 size={16} />
                      </button>
                    </DeleteConfirmDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <div className={styles.pages}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.paginationButton} ${
                p === page ? styles.activePage : ""
              }`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          className={styles.paginationButton}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}