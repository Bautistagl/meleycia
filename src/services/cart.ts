// services/cart.ts
import { supabase } from "../lib/supabase";
import { CarritoItem, Producto, Pedido } from "../types";

export const obtenerCarritoActivoCliente = async (
  clienteId: string
): Promise<CarritoItem[] | null> => {
  const { data, error } = await supabase
    .from("items_carrito")
    .select(
      `
      *,
      producto:productos (
        id, nombre, precio, stock
      )
    `
    ) // Hacemos un join para obtener la información del producto
    .eq("client_id", clienteId)
    .is("pedido_id", null); // Filtramos por carritos que aún no son pedidos

  if (error) {
    console.error("Error al obtener el carrito:", error);
    return null;
  }

  return data as CarritoItem[];
};

export const agregarProductoAlCarrito = async (
  clienteId: string,
  productoId: number,
  cantidad: number,
  precioUnitario: number,
  nombre: string,
  descripcion: string,
  foto: string,
  marca:string,

): Promise<CarritoItem | null> => {
  // Primero, verificar si el producto ya está en el carrito activo del cliente
  const { data: existingItem, error: existingError } = await supabase
    .from("items_carrito")
    .select("*")
    .eq("client_id", clienteId)
    .eq("producto_id", productoId)
    .is("pedido_id", null)
    .single();

  if (existingError && existingError.code !== "PGRST116") {
    // PGRST116 means "no rows found"
    console.error(
      "Error al verificar item existente en carrito:",
      existingError
    );
    return null;
  }

  if (existingItem) {
    // Si ya existe, actualiza la cantidad
    const nuevaCantidad = existingItem.cantidad + cantidad;
    const { data, error } = await supabase
      .from("items_carrito")
      .update({ cantidad: nuevaCantidad })
      .eq("id", existingItem.id)
      .select()
      .single();
    if (error) {
      console.error("Error al actualizar cantidad del carrito:", error);
      return null;
    }
    return data as CarritoItem;
  } else {
    // Si no existe, inserta un nuevo item
    const { data, error } = await supabase
      .from("items_carrito")
      .insert({
        client_id: clienteId,
        producto_id: productoId,
        cantidad: cantidad,
        precio_unitario: precioUnitario,
        nombre_prod:nombre,
        descripcion:descripcion,
        foto:foto,
        marca:marca
      })
      .select()
      .single();
    if (error) {
      console.error("Error al agregar producto al carrito:", error);
      return null;
    }
    return data as CarritoItem;
  }
};

export const actualizarCantidadProductoEnCarrito = async (
  itemId: number,
  nuevaCantidad: number
): Promise<CarritoItem | null> => {
  const { data, error } = await supabase
    .from("items_carrito")
    .update({ cantidad: nuevaCantidad })
    .eq("id", itemId)
    .select()
    .single();
  if (error) {
    console.error("Error al actualizar cantidad:", error);
    return null;
  }
  return data as CarritoItem;
};

export const eliminarProductoDeCarrito = async (
  itemId: number
): Promise<boolean> => {
  const { error } = await supabase
    .from("items_carrito")
    .delete()
    .eq("id", itemId);
  if (error) {
    console.error("Error al eliminar producto del carrito:", error);
    return false;
  }
  return true;
};

export const crearPedidoDesdeCarrito = async (
  clienteId: string,
  itemsCarrito: CarritoItem[]
): Promise<Pedido | null> => {
  if (itemsCarrito.length === 0) {
    console.warn("No hay productos en el carrito para crear un pedido.");
    return null;
  }

  const totalPedido = itemsCarrito.reduce(
    (sum, item) => sum + item.cantidad * item.precio_unitario,
    0
  );

  // 1. Crear el nuevo pedido
  const { data: newPedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: clienteId,
      total: totalPedido,
      estado: "pendiente", // O el estado inicial que desees
    })
    .select()
    .single();

  if (pedidoError || !newPedido) {
    console.error("Error al crear el pedido:", pedidoError);
    return null;
  }

  // 2. Asociar los items del carrito al nuevo pedido
  const updates = itemsCarrito.map((item) => ({
    id: item.id,
    pedido_id: newPedido.id,
    nombre_prod:item.producto?.nombre,
    cantidad: item.cantidad,
    client_id: item.cliente_id, 
    producto_id: item.producto_id, 
    precio_unitario: item.precio_unitario, 
    
  }));

  const { error: updateError } = await supabase
    .from("items_carrito")
    .upsert(updates); // upsert es útil para actualizar múltiples filas

  if (updateError) {
    console.error(
      "Error al actualizar items del carrito con el ID de pedido:",
      updateError
    );
    // Considera una lógica de reversión si esto falla
    return null;
  }

  return newPedido as Pedido;
};
