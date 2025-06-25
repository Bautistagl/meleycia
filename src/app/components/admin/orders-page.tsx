// "use client";

// import { useEffect, useState } from "react";
// import styles from "./orders-page.module.css";
// import { supabase } from "@/lib/supabase"; // Adjust the import path if necessary
// import { Pedido } from "@/types";



// export default function OrdersPage() {
//   const [orders, setOrders] = useState<Pedido[]>([]);
//   const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         const { data, error } = await supabase
//           .from("pedidos")
//           .select(
//             `
//             id,
//             created_at,
//             estado,
//             observaciones,
//             cliente_id,
//             total,
//             items_carrito (
//               id,
//               producto_id,
//               cantidad,
//               precio_unitario,
//               precio_total,
//               nombre_prod,
//               descripcion,
//               foto,
//               marca
//             )
//           `
//           )
//           .order("created_at", { ascending: false }); // Order by creation date

//         if (error) {
//           throw error;
//         }

//         // Supabase returns related data as an array on the parent object.
//         // We ensure it matches the Pedido interface.
//         setOrders(data as Pedido[] || []);
//       } catch (err: any) {
//         console.error("Error fetching orders:", err.message);
//         setError("Error al cargar los pedidos. Intenta de nuevo.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []); // Empty dependency array means this runs once on mount

//   const formatDate = (dateString: string) => {
//     // Check if dateString is valid before creating a Date object
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "Fecha inválida";
//     return date.toLocaleDateString("es-ES", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatPrice = (price: number) => {
//     return `$${price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   };

//   const getStatusClass = (estado: string) => {
//     switch (estado?.toLowerCase()) { // Add null/undefined check for estado
//       case "completado":
//         return styles.statusCompleted;
//       case "pendiente":
//         return styles.statusPending;
//       case "en proceso":
//         return styles.statusInProgress;
//       case "cancelado":
//         return styles.statusCancelled;
//       default:
//         return styles.statusDefault;
//     }
//   };

//   const toggleOrderExpansion = (orderId: number) => {
//     setExpandedOrder(expandedOrder === orderId ? null : orderId);
//   };

//   if (loading) {
//     return (
//       <div className={styles.container}>
//         <main className={styles.main}>
//           <p className={styles.loadingMessage}>Cargando pedidos...</p>
//         </main>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={styles.container}>
//         <main className={styles.main}>
//           <p className={styles.errorMessage}>{error}</p>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       {/* Main Content */}
//       <main className={styles.main}>
//         <div className={styles.pageHeader}>
//           <h1 className={styles.pageTitle}>Pedidos</h1>
//           {/* <button className={styles.viewAllButton}>Ver Todos</button> Esto podría ser para filtros/paginación */}
//         </div>

//         {/* Orders Table */}
//         <div className={styles.tableContainer}>
//           {orders.length === 0 ? (
//             <p className={styles.noOrdersMessage}>No hay pedidos registrados.</p>
//           ) : (
//             <table className={styles.table}>
//               <thead>
//                 <tr>
//                   <th className={styles.tableHeader}>ID PEDIDO</th>
//                   <th className={styles.tableHeader}>CLIENTE</th>
//                   <th className={styles.tableHeader}>ESTADO</th>
//                   <th className={styles.tableHeader}>TOTAL</th>
//                   <th className={styles.tableHeader}>FECHA</th>
//                   <th className={styles.tableHeader}>OBSERVACIONES</th>
//                   <th className={styles.tableHeader}>ACCIONES</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order) => (
//                   <>
//                     <tr key={order.id} className={styles.tableRow}>
//                       <td className={styles.tableCell}>#{order.id}</td>
//                       <td className={styles.tableCell}>
//                         {order.cliente_id ? `${order.cliente_id.slice(0, 8)}...` : "N/A"}
//                       </td>
//                       <td className={styles.tableCell}>
//                         <span
//                           className={`${styles.status} ${getStatusClass(
//                             order.estado
//                           )}`}
//                         >
//                           {order.estado}
//                         </span>
//                       </td>
//                       <td className={styles.tableCell}>
//                         {formatPrice(order.total)}
//                       </td>
//                       <td className={styles.tableCell}>
//                         {formatDate(order.created_at)}
//                       </td>
//                       <td className={styles.tableCell}>
//                         {order.observaciones || "Sin observaciones"}
//                       </td>
//                       <td className={styles.tableCell}>
//                         <div className={styles.actions}>
//                           <button
//                             className={styles.actionButton}
//                             onClick={() => toggleOrderExpansion(order.id)}
//                             title="Ver detalles"
//                           >
//                             {expandedOrder === order.id ? "➖" : "➕"} {/* Change icon based on expansion state */}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                     {expandedOrder === order.id && (
//                       <tr className={styles.expandedRow}>
//                         <td colSpan={7} className={styles.expandedCell}>
//                           <div className={styles.orderDetails}>
//                             <h4 className={styles.orderDetailsTitle}>
//                               Detalles del Pedido #{order.id}
//                             </h4>
//                             {order.items_carrito &&
//                             order.items_carrito.length > 0 ? (
//                               <div className={styles.itemsGrid}>
//                                 {order.items_carrito.map((item) => (
//                                   <div key={item.id} className={styles.orderItem}>
//                                     {/* Optional: Add item.foto here if you want to display images */}
//                                     {/* {item.foto && <img src={item.foto} alt={item.nombre_prod} className={styles.itemImage} />} */}
//                                     <div className={styles.itemInfo}>
//                                       <h5 className={styles.itemName}>
//                                         {item.marca}
//                                       </h5>
//                                       <p className={styles.itemDescription}>
//                                         {item.descripcion || "Sin descripción"}
//                                       </p>
//                                       <p className={styles.itemBrand}>
//                                         Marca: {item.marca || "N/A"}
//                                       </p>
//                                     </div>
//                                     <div className={styles.itemPricing}>
//                                       <p>Cantidad: {item.cantidad}</p>
//                                       <p>
//                                         Precio unitario:{" "}
//                                         {formatPrice(item.precio_unitario)}
//                                       </p>
//                                       <p className={styles.itemTotal}>
//                                         Total: {formatPrice(item.precio_total)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <p className={styles.noItemsMessage}>
//                                 No hay ítems para este pedido.
//                               </p>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }