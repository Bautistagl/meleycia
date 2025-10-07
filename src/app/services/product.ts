// src/services/product.ts

import { createClient } from "@supabase/supabase-js";
import type { Producto } from "@/types";

// Reemplaza con tus variables de entorno (o usa el cliente ya inicializado si lo tienes en otro lugar)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Actualiza el estado de stock de un producto en la base de datos.
 * @param codigo El código (ID) del producto.
 * @param newStock El nuevo estado de stock (true/false).
 * @returns El producto actualizado o null si hay un error.
 */
export async function updateProductStock(
  codigo: Producto["codigo"], // El tipo de código puede ser string o number
  newStock: boolean
): Promise<Producto | null> {
  // Asumiendo que el nombre de tu tabla es 'productos' y la columna de stock es 'stock'
  const { data, error } = await supabase
    .from("productos") // Asegúrate de que este es el nombre de tu tabla
    .update({ stock: newStock })
    .eq("codigo", codigo) // 'codigo' es la columna de identificación del producto
    .select() // Opcional: devuelve el registro actualizado
    .single();

  if (error) {
    console.error("Error al actualizar el stock:", error.message);
    // Podrías lanzar un error o retornar null
    return null;
  }

  // El objeto 'data' contendrá el producto actualizado (si usamos .single())
  return data as Producto; 
}