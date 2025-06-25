import { Producto } from "@/types";
import styles from "./ProductCard.module.css";
import useAuth from "@/hooks/useAuth";
import { agregarProductoAlCarrito } from "@/services/cart";
import { useState } from "react"; // Necesitarás estado para controlar el modal
import Link from "next/link"; // Si usas Next.js para la navegación
import Swal from "sweetalert2";

interface ProductoCardProps {
  producto: Producto;
}

export function ProductCard({ producto }: ProductoCardProps) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false); // Estado para controlar la visibilidad del modal

  const handleAddToCart = async () => {
    if (!user?.id) {
      setShowLoginModal(true); // Muestra el modal si el usuario no está logueado
      return;
    }
    const clienteId = user.id;
    const addedItem = await agregarProductoAlCarrito(
      clienteId,
      producto.id,
      1,
      producto.precio,
      producto.nombre,
      producto.description,
      producto.imageUrl,
      producto.marca
    );
    if (addedItem) {
Swal.fire({
  position: "bottom-right",
  icon: "success",
  title: "Producto añadido al pedido",
  showConfirmButton: false,
  timer: 1500,
  customClass: {
    popup: 'swal-horizontal-layout', // Aplica esta clase al contenedor principal del popup
    icon: 'swal-small-icon',       // Mantén tu clase para el tamaño del ícono si quieres
    title: 'swal-no-margin-title'  // Una clase para quitar el margen por defecto del título
  }
});
    } else {
      alert("Error al añadir producto al carrito.");
    }
  };

  return (
    <div>
           {showLoginModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Inicia sesión para agregar al carrito</h2>
            <p>Necesitas estar logueado para añadir productos a tu carrito de compras.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowLoginModal(false)} className={styles.modalCancelButton}>
                Cerrar
              </button>
              <Link href="/login" passHref> {/* Asegúrate de que '/login' sea tu ruta de inicio de sesión */}
                <button className={styles.modalLoginButton}>Iniciar Sesión</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    <div className={styles.card}>
      <div className={styles.stock}>
        <span className={producto.stock === true ? styles.inStock : styles.outOfStock}>
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
          <img src={producto.imageUrl} alt={producto.nombre} className={styles.image} />
        ) : (
          <img src="/placeholder-product.jpg" alt="Imagen no disponible" className={styles.image} />
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

        <p className={styles.description}>{producto.description}</p>

        <div className={styles.footer}>
          {producto.precio_oferta && producto.precio_oferta < producto.precio ? (
            <div className={styles.pricingContainer}>
              <div className={styles.originalPrice}>${producto.precio.toFixed(2)}</div>
              <div className={styles.offerPrice}>
                <span className={styles.offerPriceText}>${producto.precio_oferta.toFixed(2)}</span>
                <span className={styles.discountPercentage}>
                  {Math.round(((producto.precio - producto.precio_oferta) / producto.precio) * 100)}% OFF
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.price}>${producto.precio.toFixed(2)}</div>
          )}
          <button onClick={handleAddToCart} className={producto.stock ? styles.addButton : styles.noStock}>
            Agregar
          </button>
        </div>
      </div>

     
 
    </div>
    </div>
  );
}