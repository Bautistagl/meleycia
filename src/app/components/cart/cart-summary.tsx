"use client"

import { useMemo, useState } from "react";
import type { CarritoItem } from "@/types";
import styles from "./cart-summary.module.css";

interface CartSummaryProps {
  items: CarritoItem[];
  onCheckout: () => void;
  loading: boolean;
  onSelectVendedor: (data: { nombre: string; numero: number }) => void;
}

export default function CartSummary({
  items,
  onCheckout,
  loading,
  onSelectVendedor,
}: CartSummaryProps) {
  const [vendedor, setVendedor] = useState("");

  const vendedores = [
    { nombre: "No tengo vendedor", numero: 1 },
    { nombre: "OSCAR", numero: 51 },
    { nombre: "FLAVIO", numero: 52 },
    { nombre: "MARITA", numero: 53 },
    { nombre: "LEONARDO", numero: 54 },
    { nombre: "GUALA", numero: 56 },
    { nombre: "ANDRES", numero: 57 },
    { nombre: "RICARDO", numero: 59 },
    { nombre: "GRAFF", numero: 62 },
    { nombre: "MARCO", numero: 64 },
    { nombre: "ROSA", numero: 75 },
    { nombre: "LORENA", numero: 76 },
    { nombre: "CHRISTIAN", numero: 77 },
    { nombre: "LUCAS", numero: 4 },
    { nombre: "FELIX", numero: 9 },
    { nombre: "JORGE", numero: 18 },
    { nombre: "ALEJANDRA", numero: 19 },
    { nombre: "NAHUEL", numero: 26 },
  ];

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const precioBase = item.producto?.precio ?? 0;
      const oferta = item.producto?.precio_oferta;

      const precioFinal = oferta && oferta > 0 ? oferta : precioBase;

      return sum + precioFinal * item.cantidad;
    }, 0);
  }, [items]);

  const total = subtotal;

  return (
    <div className={styles.summary}>
      <div className={styles.summaryContent}>
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <label style={{ marginTop: "1rem", display: "block" }}>
          Selecciona tu vendedor antes de hacer el pedido
        </label>

        <select
          value={vendedor}
          className={styles.select}
          onChange={(e) => {
            const nombre = e.target.value;
            setVendedor(nombre);

            const obj = vendedores.find((v) => v.nombre === nombre);
            if (obj)
              onSelectVendedor({ nombre: obj.nombre, numero: obj.numero });
          }}
        >
          <option value="">-- Seleccionar --</option>
          {vendedores.map((v) => (
            <option key={v.numero} value={v.nombre}>
              {v.nombre}
            </option>
          ))}
        </select>

        <p>
          Los precios no incluyen IVA y pueden ser modificados sin previo aviso.
        </p>

        <div className={styles.actions}>
          {vendedor !== "" && (
            <button
              className={styles.checkoutBtn}
              onClick={onCheckout}
              disabled={loading || items.length === 0}
            >
              Realizar Pedido
            </button>
          )}

          <a href="/productos" className={styles.continueBtn}>
            CONTINUAR PEDIDO
          </a>
        </div>
      </div>
    </div>
  );
}
