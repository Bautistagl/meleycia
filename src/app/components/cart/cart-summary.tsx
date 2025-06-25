"use client"

import { useMemo } from "react"
import type { CarritoItem } from "@/types"
import styles from "./cart-summary.module.css"

interface CartSummaryProps {
  items: CarritoItem[]
  onCheckout: () => void
  loading:boolean
}

export default function CartSummary({ loading, items, onCheckout }: CartSummaryProps) {
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.producto?.precio * item.cantidad, 0)
  }, [items])






  const total = subtotal 

  return (
    <div className={styles.summary}>
      <h2 className={styles.summaryTitle}>RESUMEN DEL PEDIDO</h2>

      <div className={styles.summaryContent}>


        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div className={styles.actions}>
                    <button
                className={styles.checkoutBtn} 
                onClick={onCheckout}
                disabled={loading || items.length === 0}
            >
                Realizar Pedido por WhatsApp
            </button>

          <a href="/productos" className={styles.continueBtn}>
            CONTINUAR PEDIDO
          </a>
        </div>

   
      </div>
    </div>
  )
}
