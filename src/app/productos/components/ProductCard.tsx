"use client";

import type { Producto } from "@/types";
import styles from "./ProductCard.module.css";
// import useAuth from "@/hooks/useAuth";
// import { agregarProductoAlCarrito } from "@/services/cart";
// import Swal from "sweetalert2";
import { useState } from "react";
import Link from "next/link";
import { updateProductStock } from "@/app/services/product";

interface ProductoCardProps {
  producto: Producto;
  onStockChange?: (productId: string | number, newStock: boolean) => void;
  admin: boolean;
  isCombo: boolean;
}

// Función auxiliar para formatear un número a formato de moneda (ej: 2.343,33)
const formatMoney = (value: number | null): string => {
  if (value === null || isNaN(value)) {
    return "";
  }
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function ProductCard({
  producto,
  onStockChange,
  admin,
  isCombo,
}: ProductoCardProps) {
  // const { user } = useAuth();
  // const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stockEnabled, setStockEnabled] = useState(producto.stock);

  const [isLoading, setIsLoading] = useState(false);

  const handleStockToggle = async () => {
    // Cambiado a asíncrono
    const newStock = !stockEnabled;

    if (isLoading) return; // Evitar múltiples clicks

    setIsLoading(true); // Iniciar carga

    try {
      // 1. Llamar al servicio de actualización
      const updatedProduct = await updateProductStock(
        producto.codigo,
        newStock
      );

      if (updatedProduct) {
        // 2. Si la actualización en BD fue exitosa
        setStockEnabled(newStock); // Actualiza el estado local
        // Opcional: Mostrar una notificación de éxito (si usas Swal)
        // Swal.fire("Éxito", `Stock de ${producto.nombre} actualizado a ${newStock ? 'CON STOCK' : 'SIN STOCK'}`, "success");

        // 3. Notificar al componente padre si es necesario (opcional)
        if (onStockChange) {
          onStockChange(producto.codigo, newStock);
        }
      } else {
        // La BD no se actualizó, revertir el estado (o no actualizarlo nunca)
        // Opcional: Mostrar una notificación de error
        // Swal.fire("Error", "No se pudo actualizar el stock en la base de datos.", "error");
        console.error(
          "Fallo al actualizar el producto, revisar logs de updateProductStock."
        );
      }
    } catch (error) {
      // Manejar errores de red o del servicio
      // Swal.fire("Error", "Ocurrió un error de red al intentar actualizar.", "error");
      console.error("Error en handleStockToggle:", error);
    } finally {
      setIsLoading(false); // Finalizar carga, independientemente del resultado
    }
  };
  return (
    <div>
      {showLoginModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Inicia sesión para agregar al carrito</h2>
            <p>
              Necesitas estar logueado para añadir productos a tu carrito de
              compras.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowLoginModal(false)}
                className={styles.modalCancelButton}
              >
                Cerrar
              </button>
              <Link href="/login" passHref>
                <button className={styles.modalLoginButton}>
                  Iniciar Sesión
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      {isCombo ? (
        <div className={styles.card}>
          <div className={styles.stockToggleContainer}>
            <div className={styles.stockInfo}>
              <span className={styles.stockLabel}>Stock:</span>
              <span
                className={
                  stockEnabled
                    ? styles.stockStatusActive
                    : styles.stockStatusInactive
                }
              >
                {stockEnabled ? "Con stock" : "Sin stock"}
              </span>
            </div>
          </div>

          {/* {producto.precio_oferta && producto.precio_oferta < producto.precio && (
          <div className={styles.offerBadge}>
            <span className={styles.offerText}>¡a!</span>
          </div>
        )} */}
          <div className={styles.imageContainer}>
            {producto.imageUrl ? (
              <img
                src={producto.imageUrl || "/placeholder.svg"}
                alt={producto.nombre}
                className={styles.image}
              />
            ) : (
              <img
                src="/placeholder.svg"
                alt="Imagen no disponible"
                className={styles.image}
              />
            )}
          </div>

          <div className={styles.content}>
            <h3 className={styles.title}>{producto.nombre}</h3>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Descripcion:</span>
              </div>
              <h2 className={styles.value}>
                <strong> {producto.descripcion}</strong>
              </h2>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.stockToggleContainer}>
            <div className={styles.stockInfo}>
              <span className={styles.stockLabel}>Stock:</span>
              <span
                className={
                  stockEnabled
                    ? styles.stockStatusActive
                    : styles.stockStatusInactive
                }
              >
                {stockEnabled ? "Con stock" : "Sin stock"}
              </span>
            </div>
            {admin ? (
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={stockEnabled}
                  disabled={isLoading}
                  onChange={handleStockToggle}
                  className={styles.toggleInput}
                />
                {/* Opcional: Mostrar un spinner o indicador de carga */}
                {isLoading ? (
                  <span className={styles.loadingIndicator}>🔄</span>
                ) : (
                  <span className={styles.toggleSlider}></span>
                )}
              </label>
            ) : (
              ""
            )}
          </div>

          {/* {producto.precio_oferta && producto.precio_oferta < producto.precio && (
          <div className={styles.offerBadge}>
            <span className={styles.offerText}>¡a!</span>
          </div>
        )} */}
          <div className={styles.imageContainer}>
            {producto.imageUrl ? (
              <img
                src={producto.imageUrl || "/placeholder.svg"}
                alt={producto.nombre}
                className={styles.image}
              />
            ) : (
              <img
                src="/placeholder.svg"
                alt="Imagen no disponible"
                className={styles.image}
              />
            )}
          </div>

          <div className={styles.content}>
            <h3 className={styles.title}>{producto.nombre}</h3>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Codigo:</span>
                <h2 className={styles.value}>
                  <strong> {producto.codigo}</strong>
                </h2>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.label}>Marca:</span>
                <span className={styles.value}>{producto.marca}</span>
              </div>
            </div>

            {producto.precio_oferta &&
            producto.precio_oferta < producto.precio ? (
              <div className={styles.pricingContainer}>
                <div className={styles.originalPrice}>
                  ${formatMoney(producto.precio)}{" "}
                  {/* <-- Aplicado el formato */}
                </div>
                <div className={styles.offerPrice}>
                  <span className={styles.offerPriceText}>
                    ${formatMoney(producto.precio_oferta)}{" "}
                    {/* <-- Aplicado el formato */}
                  </span>
                  <span className={styles.discountPercentage}>
                    {Math.round(
                      ((producto.precio - producto.precio_oferta) /
                        producto.precio) *
                        100
                    )}
                    % OFF
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.price}>
                ${formatMoney(producto.precio)}
              </div> /* <-- Aplicado el formato */
            )}
          </div>
        </div>
      )}
    </div>
  );
}

