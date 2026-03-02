// services/cart.ts
import { supabase } from "../lib/supabase";
import { CarritoItem, Pedido } from "../types";

export const obtenerCarritoActivoCliente = async (
  clienteId: string
): Promise<CarritoItem[] | null> => {
  const { data, error } = await supabase
    .from("items_carrito")
    .select(
      `
      *,
      producto:productos (
        id, nombre, precio, stock, precio_oferta
      ),
      combo:combos (
        id, nombre, precio, stock, precio_oferta
      )
    `
    )
    .eq("client_id", clienteId);

  if (error) return null;
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
  marca: string,
  codigo: string
): Promise<CarritoItem | null> => {
  const { data: existingItem, error: existingError } = await supabase
    .from("items_carrito")
    .select("*")
    .eq("client_id", clienteId)
    .eq("producto_id", productoId)
    .single();

  if (existingError && existingError.code !== "PGRST116") return null;

  if (existingItem) {
    const nuevaCantidad = existingItem.cantidad + cantidad;
    const { data, error } = await supabase
      .from("items_carrito")
      .update({ cantidad: nuevaCantidad })
      .eq("id", existingItem.id)
      .select()
      .single();
    if (error) return null;
    return data as CarritoItem;
  }

  const { data, error } = await supabase
    .from("items_carrito")
    .insert({
      client_id: clienteId,
      producto_id: productoId,
      cantidad,
      precio_unitario: precioUnitario,
      nombre_prod: nombre,
      descripcion,
      foto,
      marca,
      codigo,
    })
    .select()
    .single();

  if (error) return null;
  return data as CarritoItem;
};

export const agregarComboAlCarrito = async (
  clienteId: string,
  comboId: string,
  cantidad: number,
  precioUnitario: number,
  nombre: string,
  descripcion: string,
  foto: string
): Promise<CarritoItem | null> => {
  const { data: existingItem, error: existingError } = await supabase
    .from("items_carrito")
    .select("*")
    .eq("client_id", clienteId)
    .eq("combo_id", comboId)
    .single();

  if (existingError && existingError.code !== "PGRST116") return null;

  if (existingItem) {
    const nuevaCantidad = existingItem.cantidad + cantidad;
    const { data, error } = await supabase
      .from("items_carrito")
      .update({ cantidad: nuevaCantidad })
      .eq("id", existingItem.id)
      .select()
      .single();
    if (error) return null;
    return data as CarritoItem;
  }

  const { data, error } = await supabase
    .from("items_carrito")
    .insert({
      client_id: clienteId,
      combo_id: comboId,
      cantidad,
      precio_unitario: precioUnitario,
      nombre_prod: nombre,
      descripcion,
      foto,
    })
    .select()
    .single();

  if (error) return null;
  return data as CarritoItem;
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

  if (error) return null;
  return data as CarritoItem;
};
export const eliminarProductoDeCarrito = async (
  itemId: number
): Promise<boolean> => {
  const { error } = await supabase
    .from("items_carrito")
    .delete()
    .eq("id", itemId);

  return !error;
};

export const crearPedidoDesdeCarrito = async (
  clienteId: string,
  itemsCarrito: CarritoItem[],
  numeroVendedor: number,
  nombreVendedor: string
): Promise<Pedido | null> => {
  if (itemsCarrito.length === 0) return null;
  const totalPedido = itemsCarrito.reduce(
    (sum, item) => sum + item.cantidad * item.precio_unitario,
    0
  );

  const { data: newPedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: clienteId,
      total: totalPedido,
      estado: "pendiente",
      numero_vendedor: numeroVendedor,
      vendedor: nombreVendedor,
    })
    .select()
    .single();

  // Si Supabase no devuelve fila, también es error
  if (pedidoError || !newPedido) {
    console.error("Error al crear pedido:", pedidoError);
    return null;
  }
  // 2. Crear los items del pedido
  const pedidoItems = itemsCarrito.map((item) => ({
    pedido_id: newPedido.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    nombre_prod: item.nombre_prod || item.producto?.nombre,
    descripcion: item.descripcion,
    foto: item.foto,
    marca: item.marca,
    codigo: item.codigo,
  }));

  const { error: itemsError } = await supabase
    .from("pedido_items")
    .insert(pedidoItems);

  if (itemsError) {
    console.error("Error al insertar items del pedido:", itemsError);
    return null;
  }

  // 3. Vaciar carrito
  await supabase.from("items_carrito").delete().eq("client_id", clienteId);

  return newPedido as Pedido;
};
