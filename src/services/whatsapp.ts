// services/cart.ts (o un nuevo archivo, por ejemplo, utils/whatsapp.ts)

import { CarritoItem, Producto } from '../types'; // Asegúrate de que CarritoItem incluye 'producto'

/**
 * Genera el texto del mensaje de WhatsApp para un carrito dado.
 * @param itemsCarrito Los ítems del carrito con la información del producto.
 * @param nombreCliente (Opcional) El nombre del cliente para personalizar el saludo.
 * @returns El string formateado para WhatsApp.
 */
export const generarMensajeWhatsappCarrito = (
  itemsCarrito: (CarritoItem & { producto: Producto })[], // Asegúrate de que 'producto' esté incluido
  nombreCliente?: string
): string => {
  let mensaje = `¡Hola! Soy ${nombreCliente ? nombreCliente : 'un cliente'} y este es mi pedido:\n\n`;

  let totalGeneral = 0;

  itemsCarrito.forEach(item => {
    const nombreProducto = item.producto?.nombre || 'Producto Desconocido';
    const precioUnitario = item.producto?.precio || 0; // Usar el precio unitario del carrito
    const subtotalItem = item.cantidad * precioUnitario;

    mensaje += `- ${item.cantidad} x ${nombreProducto} ($${precioUnitario.toFixed(2)} c/u) = $${subtotalItem.toFixed(2)}\n`;
    totalGeneral += subtotalItem;
  });

  mensaje += `\nTotal del pedido: $${totalGeneral.toFixed(2)}`;
  mensaje += `\n\n¡Espero su confirmación!`;

  return encodeURIComponent(mensaje); // Codifica el mensaje para la URL
};

