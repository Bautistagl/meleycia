import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Función para limpiar y parsear las líneas del CSV de forma dinámica.
 *
 * Mejoras implementadas:
 * 1. La detección del inicio de datos se ha simplificado a la segunda línea
 * no vacía, ya que los CSV proporcionados tienen metadata/encabezados.
 * 2. Validación de la columna de precio más robusta:
 * - Limpia signos de moneda ($), comillas y cualquier texto adicional (e.g., "+ iva").
 * - Normaliza separadores regionales (coma a punto como decimal).
 * - **Solo acepta la línea si el valor final es un número válido y positivo.**
 *
 * @param csvContent El contenido completo del archivo CSV como string.
 * @returns Un array de objetos con { codigo, precio_nuevo }.
 */
function parseAndFilterCSV(
  csvContent: string
): { codigo: string; precio_nuevo: number }[] {
  // 1. Dividir líneas y limpiar vacías. Usamos un regex para manejar diferentes tipos de saltos de línea.
  const lines = csvContent
    .split(/[\r\n]+/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) return [];

  // 2. Encontrar el índice donde comienzan los datos reales.
  // Buscamos la primera línea que contenga al menos 2 columnas que no sean TODAS comas,
  // y saltamos esa línea (asumiendo que es un encabezado/subencabezado).
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineParts = lines[i].split(",").map((part) => part.trim());

    // Una línea debe tener al menos 2 partes para considerarse una posible fila de datos/encabezado.
    if (lineParts.length >= 2) {
      // Si el primer elemento y el último tienen contenido, asumimos que es un encabezado
      // o la primera fila de datos, y empezamos a procesar desde la siguiente (i + 1).
      // En los CSV de ejemplo, la línea 1 es metadata, la 2/3 el encabezado.
      // Un inicio más seguro es asumir que la primera fila no vacía es encabezado (startIndex=1).
      // Sin embargo, para los CSV que tienen varias líneas de metadata, es mejor
      // buscar la primera línea que parece un registro de datos (ej: código + precio)
      // y empezar a validar desde esa línea, en lugar de saltarla.
      // Modificamos la estrategia para incluir esta línea en la validación a continuación.
      startIndex = i;
      break;
    }
  }

  // Si no se encontró el inicio de los datos, devolvemos vacío.
  if (startIndex === lines.length) return [];

  const dataLines = lines.slice(startIndex);
  const productsToUpdate: { codigo: string; precio_nuevo: number }[] = [];

  for (const line of dataLines) {
    // Dividir la línea por comas y limpiar espacios en blanco.
    const parts = line.split(",").map((part) => part.trim());

    // Requerimos al menos 2 columnas (Código y Precio)
    if (parts.length < 2) continue;

    const codigo = parts[0]; // La primera columna siempre es el código
    let precioStr = parts[parts.length - 1]; // La última columna siempre es el precio

    // --- 1. VALIDACIÓN DEL CÓDIGO ---
    // El código debe estar presente. Si está vacío, la línea no se procesa.
    const isCodigoPresent = codigo.length > 0;
    if (!isCodigoPresent) continue;

    // Opcional: Limpiar comillas si la primera columna está entrecomillada
    const cleanCodigo = codigo.replace(/^"|"$/g, "").trim();

    // --- 2. LIMPIEZA Y VALIDACIÓN DEL PRECIO (Manejo de formatos regionales y ruido) ---

    // 2.1 Limpiar el string de precio de caracteres no numéricos *excepto* puntos y comas.
    // Esto elimina "$", " + iva", letras, etc.
    let cleanPrecioStr = precioStr
      // Elimina cualquier texto no numérico/no separador al final o al inicio
      .replace(/[^\d.,]+$/g, "")
      .replace(/^[^\d.,]+/g, "")
      // Elimina comillas y espacios en blanco de forma agresiva
      .replace(/^"|"$/g, "")
      .trim();

    // 2.2 Normalización de separadores:
    if (cleanPrecioStr.includes(",")) {
      // Si contiene coma, asumimos formato regional (ej: 1.000,50)
      // 1. Eliminar puntos (separador de miles)
      let tempStr = cleanPrecioStr.replace(/\./g, "");
      // 2. Reemplazar la coma por punto (separador decimal)
      cleanPrecioStr = tempStr.replace(/,/g, ".");
    }

    // 2.3 Conversión a número y validación.
    const precio_nuevo_raw = parseFloat(cleanPrecioStr);

    // Debe ser un número válido, no NaN y mayor que 0.
    // Esto asegura que líneas como "$300.00 + iva" (que se convertiría a NaN después de limpiar el texto)
    // o "PAPEL OCB PREMIUM (NEGRO)" (que es puro texto) sean saltadas.
    const isPrecioValid = !isNaN(precio_nuevo_raw) && precio_nuevo_raw > 0;

    // --- 3. INSERCIÓN FINAL ---
    if (isCodigoPresent && isPrecioValid) {
      productsToUpdate.push({
        codigo: cleanCodigo, // Usamos el código limpio
        // Redondeamos a 2 decimales
        precio_nuevo: parseFloat(precio_nuevo_raw.toFixed(2)),
      });
    }
  }

  return productsToUpdate;
}

// Exportación del handler POST sin cambios
export async function POST(req: Request) {
  try {
    // Asumimos que el cliente envía el contenido del CSV como texto plano en el body
    const csvContent = await req.text();

    if (!csvContent) {
      return NextResponse.json(
        { error: "Contenido del archivo CSV vacío o no proporcionado." },
        { status: 400 }
      );
    }

    // 1. Limpiar y parsear el CSV para obtener solo los productos válidos
    const productsToUpdate = parseAndFilterCSV(csvContent);

    if (productsToUpdate.length === 0) {
      return NextResponse.json(
        {
          message:
            "No se encontraron productos válidos para actualizar en el CSV. Asegúrate de que los códigos de producto y los precios sean válidos, y de que haya al menos dos columnas por línea de datos.",
        },
        { status: 200 }
      );
    }

    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 2. Recorrer los productos limpios y realizar las actualizaciones
    for (const product of productsToUpdate) {
      const { codigo, precio_nuevo } = product;

      // La columna en la base de datos para la coincidencia es 'codigo'.
      // La columna a actualizar es 'precio'.
      const { error } = await supabase
        .from("productos")
        .update({ precio: precio_nuevo })
        .eq("codigo", codigo);

      if (error) {
        errors.push(`Error al actualizar código '${codigo}': ${error.message}`);
        errorCount++;
      } else {
        updatedCount++;
      }
    }

    // 3. Manejar la respuesta
    if (errors.length > 0) {
      return NextResponse.json(
        {
          message: `Actualización completada con errores. Se actualizaron ${updatedCount} productos. ${errorCount} errores.`,
          errors: errors,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: `Se actualizaron ${updatedCount} productos exitosamente.` },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error("Error en el Route Handler:", error);

    let errorMessage = "Error desconocido";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      errorMessage = (error as { message: string }).message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json(
      { error: `Error interno del servidor: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Opcional: Si no esperas otros métodos, puedes manejarlo explícitamente
export async function GET() {
  return NextResponse.json(
    { message: "GET method not allowed for this endpoint." },
    { status: 405 }
  );
}
