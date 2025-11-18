// // components/Carrito.tsx
// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import useAuth from '../../hooks/useAuth';
// import {
//   obtenerCarritoActivoCliente,
//   actualizarCantidadProductoEnCarrito,
//   eliminarProductoDeCarrito,
//   crearPedidoDesdeCarrito
// } from '../../services/cart';
// import { CarritoItem } from '@/types';
// import styles from "./cart.module.css";

// const Carrito: React.FC = () => {
//   const { user } = useAuth();
//   const [cartItems, setCartItems] = useState<CarritoItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [numeroVendedor, setNumeroVendedor] = useState<number | null>(null);

//   const refetchCart = useCallback(async () => {
//     if (user?.id) {
//       setLoading(true);
//       const items = await obtenerCarritoActivoCliente(user.id);
//       if (items) {
//         setCartItems(items);
//       } else {
//         setCartItems([]);
//       }
//       setLoading(false);
//     } else {
//       setCartItems([]);
//       setLoading(false);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     refetchCart();
//   }, [user, refetchCart]);

//   const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       handleRemoveItem(itemId);
//       return;
//     }
//     const updatedItem = await actualizarCantidadProductoEnCarrito(itemId, newQuantity);
//     if (updatedItem) {
//       refetchCart(); // Actualiza el estado del carrito
//     } else {
//       alert('Error al actualizar cantidad.');
//     }
//   };

//   const handleRemoveItem = async (itemId: number) => {
//     const removed = await eliminarProductoDeCarrito(itemId);
//     if (removed) {
//       refetchCart();
//     } else {
//       alert('Error al eliminar producto.');
//     }
//   };

//   const handleCheckout = async () => {
//     if (!user?.id || cartItems.length === 0) {
//       alert('No hay productos en el carrito o no has iniciado sesión.');
//       return;
//     }
//     const confirmedOrder = await crearPedidoDesdeCarrito(user.id, cartItems, numeroVendedor);
//     if (confirmedOrder) {
//       alert(`Pedido #${confirmedOrder.id} creado exitosamente!`);
//       refetchCart();
//     } else {
//       alert('Error al crear el pedido.');
//     }
//   };

//   if (loading) {
//     return <p>Cargando carrito...</p>;
//   }

//   if (!user) {
//     return <p>Inicia sesión para ver tu carrito.</p>;
//   }

//   if (cartItems.length === 0) {
//     return <p className={styles.span} >Tu carrito está vacío.</p>;
//   }

//   const totalCarrito = cartItems.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

//   return (
//     <div style={{ border: '1px solid #ddd', padding: '20px', margin: '20px' }}>
//       <h2>Tu Carrito</h2>
//       {cartItems.map((item) => (
//         <div key={item.id} style={{ marginBottom: '10px' }}>
//           <p>{item.producto?.nombre} - Cantidad:
//             <input
//               type="number"
//               value={item.cantidad}
//               onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
//               min="1"
//             />
//             - ${item.precio_unitario} c/u
//             <button onClick={() => handleRemoveItem(item.id)} style={{ marginLeft: '10px' }}>Eliminar</button>
//           </p>
//         </div>
//       ))}
//       <h3>Total: ${totalCarrito.toFixed(2)}</h3>
//       <button onClick={handleCheckout}>Proceder al Pago</button>
//     </div>
//   );
// };

// export default Carrito;
