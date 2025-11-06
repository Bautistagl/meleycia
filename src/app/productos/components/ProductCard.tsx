"use client";

import type { Producto } from "@/types";
import styles from "./ProductCard.module.css";
import useAuth from "@/hooks/useAuth"; // Habilitado
import { agregarProductoAlCarrito } from "@/services/cart";
import Swal from "sweetalert2";
import { useState, useCallback } from "react"; // Añadido useCallback
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
  const { user } = useAuth(); // Habilitado
  const [quantity, setQuantity] = useState(1); // Habilitado
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stockEnabled, setStockEnabled] = useState(producto.stock);

  const [isLoading, setIsLoading] = useState(false); // Se usará para el carrito también

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

        // 3. Notificar al componente padre si es necesario (opcional)
        if (onStockChange) {
          onStockChange(producto.codigo, newStock);
        }
      } else {
        console.error(
          "Fallo al actualizar el producto, revisar logs de updateProductStock."
        );
      }
    } catch (error) {
      console.error("Error en handleStockToggle:", error);
    } finally {
      setIsLoading(false); // Finalizar carga, independientemente del resultado
    }
  };

  // --- LÓGICA AÑADIDA PARA EL CARRITO ---
  const handleAddToCart = useCallback(async () => {
    // 1. Verificar si el usuario está logueado y tiene un client_id
    // Asumimos que el tipo User de useAuth() tiene 'client_id' si está logueado
    if (!user || !user.id) {
      setShowLoginModal(true); // Mostrar modal de inicio de sesión
      return;
    }

    // 2. Validación de cantidad
    if (quantity < 1 || !Number.isInteger(quantity)) {
      Swal.fire(
        "Cantidad Inválida",
        "Por favor, ingresa una cantidad válida.",
        "error"
      );
      return;
    }

    // 3. Iniciar carga
    setIsLoading(true);

    try {
      // 4. Determinar el precio a enviar
      const precioParaCarrito = producto.precio_oferta ?? producto.precio;

      // 5. Asegurarse de que producto.id es un número (requerido por la utilidad)
      // Si tu ID de producto se llama diferente (ej: producto.id_producto), ajusta esta línea.
      const productoIdNumerico = producto.id as number;

      if (typeof productoIdNumerico !== "number") {
        throw new Error("El ID del producto no es un número válido.");
      }

      // 6. Llamar a la utilidad del carrito
      const result = await agregarProductoAlCarrito(
        user.id,
        productoIdNumerico,
        quantity,
        precioParaCarrito,
        producto.nombre,
        producto.descripcion || "",
        producto.imageUrl || "/placeholder.svg",
        producto.marca || "",
        producto.codigo || ""
      );

      // 7. Mostrar feedback
      if (result) {
        Swal.fire({
          icon: "success",
          title: "¡Agregado!",
          text: `${quantity}x ${producto.nombre} se agregó a tu carrito.`,
          timer: 2000,
          showConfirmButton: false,
        });
        setQuantity(1); // Resetear la cantidad a 1
      } else {
        Swal.fire(
          "Error",
          "No se pudo agregar el producto. Inténtalo de nuevo.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error en handleAddToCart:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error inesperado al agregar el producto.",
        "error"
      );
    } finally {
      // 8. Finalizar carga
      setIsLoading(false);
    }
  }, [user, quantity, producto]); // Dependencias del useCallback
  // --- FIN DE LA LÓGICA AÑADIDA ---

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
          {/* ... (Contenido de la card de Combo - sin cambios) ... */}
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
                </div>
                <div className={styles.offerPrice}>
                  <span className={styles.offerPriceText}>
                    ${formatMoney(producto.precio_oferta)}{" "}
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
              </div>
            )}

            {/* --- JSX AÑADIDO PARA EL CARRITO --- */}
            {/* Mostrar solo si NO es admin Y el producto TIENE stock */}
            {!admin && stockEnabled && (
              <div className={styles.actionsContainer}>
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading} // Deshabilitar mientras carga
                  className={styles.addButton}
                >
                  {isLoading ? "Añadiendo..." : "Añadir Producto"}
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className={styles.quantityInput}
                  disabled={isLoading} // Deshabilitar mientras carga
                />
              </div>
            )}
            {/* --- FIN DEL JSX AÑADIDO --- */}
          </div>
        </div>
      )}
    </div>
  );
}