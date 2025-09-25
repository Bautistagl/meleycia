import { Producto } from "@/types";
import styles from "./ProductCard.module.css";
import useAuth from "@/hooks/useAuth";
import { agregarProductoAlCarrito } from "@/services/cart";
import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

interface ProductoCardProps {
  producto: Producto;
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

export function ProductCard({ producto }: ProductoCardProps) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!user?.id) {
      setShowLoginModal(true);
      return;
    }
    const clienteId = user.id;
 
    const addedItem = await agregarProductoAlCarrito(
      clienteId,
      producto.id,
      quantity,
      producto.precio,
      producto.nombre,
      producto.description,
      producto.imageUrl,
      producto.marca,
      producto.codigo || ""
    );
    if (addedItem) {
      Swal.fire({
        position: "bottom-right",
        icon: "success",
        title: "Producto añadido al pedido",
        showConfirmButton: false,
        timer: 1000,
        customClass: {
          popup: "swal-horizontal-layout",
          icon: "swal-small-icon",
          title: "swal-no-margin-title",
        },
      });
    } else {
      alert("Error al añadir producto al carrito.");
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);

    if (value >= 1) {
      setQuantity(value);
    } else {
      setQuantity(1);
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
      <div className={styles.card}>
        <div className={styles.stock}>
          <span
            className={
              producto.stock === true ? styles.inStock : styles.outOfStock
            }
          >
            {producto.stock ? "Con stock" : "Sin stock"}
          </span>
        </div>
        {producto.precio_oferta && producto.precio_oferta < producto.precio && (
          <div className={styles.offerBadge}>
            <span className={styles.offerText}>¡OFERTA!</span>
          </div>
        )}
        <div className={styles.imageContainer}>
          {producto.imageUrl ? (
            <img
              src={producto.imageUrl}
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
              <span className={styles.label}>Categoría:</span>
              <span className={styles.value}>{producto.categoria}</span>
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
                ${formatMoney(producto.precio)} {/* <-- Aplicado el formato */}
              </div>
              <div className={styles.offerPrice}>
                <span className={styles.offerPriceText}>
                  ${formatMoney(producto.precio_oferta)} {/* <-- Aplicado el formato */}
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
            <div className={styles.price}>${formatMoney(producto.precio)}</div> /* <-- Aplicado el formato */
          )}

          <div className={styles.actionsContainer}>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className={styles.quantityInput}
            />
            <button
              onClick={handleAddToCart}
              className={producto.stock ? styles.addButton : styles.noStock}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}