"use client"

import { useMemo } from "react"
import type { CarritoItem } from "@/types"
import styles from "./cart-summary.module.css"

interface CartSummaryProps {
  items: CarritoItem[]
  onCheckout: () => void
  loading:boolean
}

export default function CartSummary({
  items,
  onCheckout,
  loading,
}: CartSummaryProps) {
  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.producto?.precio * item.cantidad,
      0
    );
  }, [items]);

  const total = subtotal;

  return (
    <div className={styles.summary}>
      <div className={styles.summaryContent}>
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <p>
          Los precios no incluyen IVA y pueden ser modificados sin previo aviso.
        </p>
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
  );
}
