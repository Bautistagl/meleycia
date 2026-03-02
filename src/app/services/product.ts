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
  id: Producto["id"],
  newStock: boolean
): Promise<Producto | null> {
  const { data, error } = await supabase
    .from("productos")
    .update({ stock: newStock })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar el stock:", error.message);
    return null;
  }

  return data as Producto;
}

export async function updateComboStock(
  id: string,
  newStock: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from("combos")
    .update({ stock: newStock })
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar el stock del combo:", error.message);
    return false;
  }

  return true;
}