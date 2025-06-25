"use client"

import { useEffect, useState, useCallback } from "react"
import useAuth from "@/hooks/useAuth"
import {
  obtenerCarritoActivoCliente,
  actualizarCantidadProductoEnCarrito,
  eliminarProductoDeCarrito,
  crearPedidoDesdeCarrito,
} from "@/services/cart" // Asegúrate de que esta ruta sea correcta para generarMensajeWhatsappCarrito
import type { CarritoItem, Producto, Cliente } from "@/types" // <--- Importa Producto y Cliente también
import CartItem from "./cart-item"
import CartSummary from "./cart-summary"
import EmptyCart from "./empty-cart"
import styles from "./cart.module.css"
import { generarMensajeWhatsappCarrito } from "@/services/whatsapp"

export default function CartContainer() {
  const { user } = useAuth() // Asumo que useAuth también proporciona el perfil del usuario (nombre, teléfono)
  const [cartItems, setCartItems] = useState<CarritoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null); // Nuevo estado para errores



  const refetchCart = useCallback(async () => {
 
    if (user?.id) {
      setLoading(true)
      const items = await obtenerCarritoActivoCliente(user.id)
      
      if (items) {
        setCartItems(items)
      } else {
        setCartItems([])
        setError('No se pudo cargar el carrito. Intenta de nuevo más tarde.');
      }
      setLoading(false)
    } 
  }, [user?.id])

  useEffect(() => {
    refetchCart()
  }, [user, refetchCart])

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }
    setLoading(true); // O un estado de carga más granular para la actualización
    const updatedItem = await actualizarCantidadProductoEnCarrito(itemId, newQuantity)
    if (updatedItem) {
      refetchCart() // Actualiza el estado del carrito
    } else {
      alert("Error al actualizar cantidad.")
    }
    setLoading(false);
  }

  const handleRemoveItem = async (itemId: number) => {
    setLoading(true); // O un estado de carga más granular para la eliminación
    const removed = await eliminarProductoDeCarrito(itemId)
    if (removed) {
      refetchCart()
    } else {
      alert("Error al eliminar producto.")
    }
    setLoading(false);
  }

  const handleCheckout = async () => {
    if (!user?.id || cartItems.length === 0) {
      alert("No hay productos en el carrito o no has iniciado sesión.")
      return
    }
    setLoading(true);
    setError(null);
    const confirmedOrder = await crearPedidoDesdeCarrito(user.id, cartItems)
    if (confirmedOrder) {
      alert(`Pedido #${confirmedOrder.id} creado exitosamente!`)
      refetchCart() // Para limpiar el carrito una vez se ha convertido en pedido
    } else {
      setError("Error al crear el pedido en la base de datos.");
      alert("Error al crear el pedido.")
    }
    setLoading(false);
  }

  // ** NUEVA FUNCIÓN PARA ENVIAR POR WHATSAPP **
  const handleEnviarPedidoWhatsapp = async () => {
    if (!user?.id || cartItems.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de enviar un pedido.');
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Crear el pedido en la base de datos (opcional, si quieres que se registre antes del WhatsApp)
    // Si no quieres que se cree el pedido en DB hasta que confirmen por WhatsApp, puedes comentar esta línea
   

    // 2. Obtener la versión más actualizada y "rica" del carrito para el mensaje de WhatsApp
    // Esto es CRÍTICO para que `generarMensajeWhatsappCarrito` tenga acceso al `item.producto`
    const carritoParaWhatsapp = await obtenerCarritoActivoCliente(user.id);

    if (!carritoParaWhatsapp || carritoParaWhatsapp.length === 0) {
      
      setError('No se pudo obtener la información del carrito para el mensaje de WhatsApp.');
      setLoading(false);
      return;
    }

    // Asegúrate de que cada item del carrito tenga la propiedad `producto` debido al join
    const carritoConDetalleProducto = carritoParaWhatsapp.filter(item => item.producto) as (CarritoItem & { producto: Producto })[];

    const nombreCliente = user.user_metadata?.full_name || user?.email || 'Estimado cliente'; // Obtén el nombre del cliente
    // 3. Generar el mensaje de WhatsApp
    const mensajeCodificado = generarMensajeWhatsappCarrito(carritoConDetalleProducto, nombreCliente);
  
    // 4. Construir la URL de WhatsApp
    const urlWhatsapp = `https://wa.me/+5491138824301/?text=${mensajeCodificado}`;

    // 5. Redirigir al usuario a WhatsApp
    window.open(urlWhatsapp, '_blank');

    setLoading(false);
    alert('¡Tu pedido ha sido enviado! Serás redirigido a WhatsApp para confirmar.');

  const nuevoPedido = await crearPedidoDesdeCarrito(user.id, cartItems);

    if (!nuevoPedido) {
      
      setError('Hubo un error al crear el pedido en la base de datos. No se pudo generar el mensaje de WhatsApp.');
      setLoading(false);
      return;
    }
    refetchCart(); 
  };

  if (loading) {
    return <div className={styles.loading}>Cargando carrito...</div>
  }

  if (error) { // Muestra el error si existe
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        {!user && <p>Por favor, <a href="/login">inicia sesión</a> para continuar.</p>}
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.emptyCart}>
        <h2 className={styles.emptyCartTitle}>Inicia sesión para ver tu carrito</h2>
        <p className={styles.emptyCartMessage}>Debes iniciar sesión para ver y gestionar tu carrito de compras.</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return <EmptyCart />
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
            <CartItem key={item.id} item={item} updateQuantity={handleUpdateQuantity} removeItem={handleRemoveItem} />
          ))}
        </div>

        {/* Aquí puedes agregar el botón para WhatsApp en tu CartSummary o directamente aquí */}
        <CartSummary loading={loading} items={cartItems} onCheckout={handleEnviarPedidoWhatsapp}/>

      
      </div>
    </div>
  )
}