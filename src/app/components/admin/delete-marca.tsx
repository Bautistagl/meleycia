"use client"

import { useState } from "react"
import {supabase} from "@/lib/supabase"
import styles from "./delete-confirm-dialog.module.css"

interface DeleteConfirmDialogProps {
  id: number;
  name: string;
  children: React.ReactNode;
}



export function DeleteMarca({ id, name, children }: DeleteConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    await supabase.from("marcas").delete().eq("id", id)
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
              <button className={styles.cancelButton} onClick={() => setIsOpen(false)}>
                Cancelar
              </button>
              <button className={styles.deleteButton} onClick={handleDelete}>
                Borrar Marca
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
