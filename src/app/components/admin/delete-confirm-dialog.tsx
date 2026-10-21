"use client"

import { useState } from "react"
import {supabase} from "@/lib/supabase"
import Swal from "sweetalert2"
import styles from "./delete-confirm-dialog.module.css"

interface DeleteConfirmDialogProps {
  id: number;
  name: string;
  children: React.ReactNode;
}



export function DeleteConfirmDialog({ id, name, children }: DeleteConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    // .select() devuelve las filas borradas: si viene vacío, no se borró nada
    const { data, error } = await supabase
      .from("productos")
      .delete()
      .eq("id", id)
      .select("id")
    setIsDeleting(false)

    if (error) {
      console.error("Error al borrar producto:", error)
      Swal.fire({
        title: "No se pudo borrar",
        text: error.message,
        icon: "error",
      })
      return
    }

    if (!data || data.length === 0) {
      Swal.fire({
        title: "No se pudo borrar",
        text: "El producto no se encontró o no hay permisos para borrarlo.",
        icon: "error",
      })
      return
    }

    setIsOpen(false)
    location.reload()
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.header}>
              <h3 className={styles.title}>Estas seguro?</h3>
              <p className={styles.description}>
                Esto va a borrar permanentemente <strong>{name}</strong>.
              </p>
            </div>
            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={() => setIsOpen(false)} disabled={isDeleting}>
                Cancelar
              </button>
              <button className={styles.deleteButton} onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Borrando..." : "Borrar Producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
