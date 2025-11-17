"use client"

import { useEffect, useState, useCallback } from "react"
import useAuth from "@/hooks/useAuth"
// Importar supabase
import { supabase } from "@/lib/supabase"; 
import {
  obtenerCarritoActivoCliente,
  actualizarCantidadProductoEnCarrito,
  eliminarProductoDeCarrito,
  crearPedidoDesdeCarrito,
} from "@/services/cart"
import type { CarritoItem, Producto } from "@/types";
import CartItem from "./cart-item";
import CartSummary from "./cart-summary";
import EmptyCart from "./empty-cart";
import styles from "./cart.module.css";

import Swal from "sweetalert2";

// Definir una interfaz para los datos del cliente que necesitamos
interface ClienteData {
  nombre: string;
  telefono_vendedor: number | null; // Cambiado a number o null basado en tu esquema
}

export default function CartContainer() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Nuevo estado para almacenar el teléfono del vendedor
  const [vendedorTelefono, setVendedorTelefono] = useState<number | null>(null);
  const [numeroVendedor, setNumeroVendedor] = useState<number | null>(null);
  // Función para obtener el cliente y su vendedor asignado
  const obtenerDatosCliente = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("clientes")
        .select("nombre, telefono_vendedor")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error al obtener datos del cliente:", error);
        // Establecer un teléfono de respaldo en caso de error
        return { telefono_vendedor: 1133478376 };
      }

      // Convertir el teléfono a número o null si es necesario
      const telefono = data?.telefono_vendedor
        ? parseInt(data.telefono_vendedor.toString(), 10)
        : null;

      return {
        nombre: data?.nombre || user?.email || "Estimado cliente",
        telefono_vendedor: telefono,
      };
    },
    [user?.email]
  );

  const refetchCart = useCallback(async () => {
    if (user?.id) {
      setLoading(true);

      // Obtener datos del cliente y vendedor
      const clienteData = await obtenerDatosCliente(user.id);
      setVendedorTelefono(clienteData.telefono_vendedor);

      // Obtener items del carrito
      const items = await obtenerCarritoActivoCliente(user.id);

      if (items) {
        setCartItems(items);
      } else {
        setCartItems([]);
        setError("No se pudo cargar el carrito. Intenta de nuevo más tarde.");
      }
      setLoading(false);
    }
  }, [user?.id, obtenerDatosCliente]); // Dependencia a obtenerDatosCliente

  useEffect(() => {
    refetchCart();
  }, [user, refetchCart]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setLoading(true);
    const updatedItem = await actualizarCantidadProductoEnCarrito(
      itemId,
      newQuantity
    );
    if (updatedItem) {
      refetchCart();
    } else {
      alert("Error al actualizar cantidad.");
    }
    setLoading(false);
  };

  const handleRemoveItem = async (itemId: number) => {
    setLoading(true);
    const removed = await eliminarProductoDeCarrito(itemId);
    if (removed) {
      refetchCart();
    } else {
      alert("Error al eliminar producto.");
    }
    setLoading(false);
  };

  // ** FUNCIÓN MODIFICADA PARA ENVIAR POR WHATSAPP **
  const handleEnviarPedidoWhatsapp = async () => {
    if (!user?.id || cartItems.length === 0) {
      alert(
        "Tu carrito está vacío. Agrega productos antes de enviar un pedido."
      );
      return;
    }
    if (numeroVendedor === null) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Obtener la versión más actualizada y "rica" del carrito
    const carritoParaWhatsapp = await obtenerCarritoActivoCliente(user.id);

    if (!carritoParaWhatsapp || carritoParaWhatsapp.length === 0) {
      setError(
        "No se pudo obtener la información del carrito para el mensaje de WhatsApp."
      );
      setLoading(false);
      return;
    }

    Swal.fire({
      title: "Su pedido ha sido recibido, nos estaremos comunicando en breve.",
      icon: "success",
    });

    // 6. Crear el pedido en la base de datos DESPUÉS de redirigir (opcional, ajusta tu flujo)
    const nuevoPedido = await crearPedidoDesdeCarrito(
      user.id,
      carritoParaWhatsapp,
      numeroVendedor
    );

    if (!nuevoPedido) {
      // Mostrar un error de DB pero permitir que continúe el flujo de WhatsApp
      console.error("Hubo un error al crear el pedido en la base de datos.");
    }

    refetchCart();
    setLoading(false);
  };

  if (loading) {
    return <div className={styles.loading}>Cargando carrito...</div>;
  }

  // ... (Resto de las validaciones y el return JSX no se modifican) ...
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        {!user && (
          <p>
            Por favor, <a href="/login">inicia sesión</a> para continuar.
          </p>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.emptyCart}>
        <h2 className={styles.emptyCartTitle}>
          Inicia sesión para ver tu carrito
        </h2>
        <p className={styles.emptyCartMessage}>
          Debes iniciar sesión para ver y gestionar tu carrito de compras.
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartGrid}>
        <div className={styles.cartItems}>
          <div className={styles.cartHeader}>
            <span className={styles.productHeader}>PRODUCTO</span>
            <span className={styles.priceHeader}>PRECIO</span>
            <span className={styles.quantityHeader}>CANTIDAD</span>
            <span className={styles.totalHeader}>TOTAL</span>
            <span className={styles.actionHeader}></span>
          </div>

          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              updateQuantity={handleUpdateQuantity}
              removeItem={handleRemoveItem}
            />
          ))}
        </div>

        {/* Aquí se llama a la función modificada */}
        <CartSummary
          loading={loading}
          items={cartItems}
          onCheckout={handleEnviarPedidoWhatsapp}
          onSelectVendedor={setNumeroVendedor}
        />
      </div>
    </div>
  );
}