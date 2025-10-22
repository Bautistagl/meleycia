import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Función para limpiar y parsear las líneas del CSV de forma dinámica.
 *
 * MODIFICACIÓN CLAVE: Se ha cambiado la forma de parsear las líneas
 * para manejar comas (,) dentro de valores entrecomillados (como los precios).
 * Ahora se usa un Regex para dividir, lo que garantiza que el precio
 * completo ("X.XXX,XX") se mantenga como una sola parte, incluso si
 * contiene comas internas.
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
  // Basado en el CSV, los datos comienzan en la tercera línea no vacía (índice 2).
  // La línea 0 es 'LUMILAGRO,,', la 1 es 'COD,DESCRIPCIÓN,$ SIN IVA'.
  // Para ser más flexible, mantenemos la lógica de búsqueda de inicio, pero
  // el CSV subido sugiere que el índice de inicio real está en la tercera línea (índice 2)
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineParts = lines[i].split(",").map((part) => part.trim());

    // Buscamos la primera línea que parece ser un encabezado de datos
    // o el primer registro (con al menos 2 partes no vacías).
    if (lineParts.length >= 2 && lineParts[0].length > 0) {
      // Asumiendo que la línea después del encabezado/subencabezado es el inicio de los datos
      startIndex = i + 1;
      break;
    }
  }

  // En el CSV 'LUMILAGRO - Sheet1.csv', los datos comienzan después de la línea 'COD,DESCRIPCIÓN,$ SIN IVA'
  // por lo que el startIndex debería ser al menos 2. Si no se encontró un patrón, forzamos a la línea 2.
  if (startIndex === 0) startIndex = 2; // Ajuste basado en la estructura del CSV
  if (startIndex >= lines.length) return []; // Si no hay datos

  const dataLines = lines.slice(startIndex);
  const productsToUpdate: { codigo: string; precio_nuevo: number }[] = [];

  // Expresión regular para dividir CSV:
  // Divide por coma (,) SOLAMENTE si NO está dentro de comillas (").
  const CSV_SPLIT_REGEX = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

  for (const line of dataLines) {
    // *** CAMBIO CLAVE AQUÍ: Usamos Regex para dividir por comas, ignorando las comas dentro de comillas. ***
    const parts = line.split(CSV_SPLIT_REGEX).map((part) => part.trim());

    // Requerimos al menos 2 columnas (Código y Precio). En este CSV, serán 3.
    if (parts.length < 2) continue;

    const codigo = parts[0]; // La primera columna siempre es el código
    // La columna de precio es la última, que ahora contendrá el valor completo entre comillas.
    const precioStr = parts[parts.length - 1];

    // --- 1. VALIDACIÓN DEL CÓDIGO ---
    const cleanCodigo = codigo.replace(/^"|"$/g, "").trim();
    const isCodigoPresent = cleanCodigo.length > 0;
    if (!isCodigoPresent) continue;

    // --- 2. LIMPIEZA Y VALIDACIÓN DEL PRECIO (Manejo de formatos regionales y ruido) ---

    // 2.1 Limpiar el string de precio de caracteres no numéricos *excepto* puntos y comas.
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
      const tempStr = cleanPrecioStr.replace(/\./g, "");
      // 2. Reemplazar la coma por punto (separador decimal)
      cleanPrecioStr = tempStr.replace(/,/g, ".");
    }

    // 2.3 Conversión a número y validación.
    const precio_nuevo_raw = parseFloat(cleanPrecioStr);

    // Debe ser un número válido, no NaN y mayor que 0.
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

// Exportación del handler POST y GET (sin cambios)
export async function POST(req: Request) {
  // ... (El resto del código del handler POST no necesita cambios)
  try {
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