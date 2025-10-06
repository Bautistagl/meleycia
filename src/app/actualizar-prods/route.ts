// app/actualizar-productos/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * Función para limpiar y parsear las líneas del CSV.
 * @param csvContent El contenido completo del archivo CSV como string.
 * @returns Un array de objetos con { codigo, precio_nuevo }.
 */
function parseAndFilterCSV(csvContent: string): { codigo: string; precio_nuevo: number }[] {
  const lines = csvContent.split("\r\n").filter((line) => line.trim() !== ""); // Dividir y limpiar líneas vacías

  const productsToUpdate: { codigo: string; precio_nuevo: number }[] = [];

  // La estructura buscada es: COD,DESCRIPCION,BL X BULTO,$ X BLISTER
  for (const line of lines) {
    const parts = line.split(",").map((part) => part.trim());

    // 1. Verificar si la línea tiene al menos 4 columnas (COD, DESCRIPCION, BULTO, PRECIO)
    if (parts.length >= 4) {
      const codigo = parts[0];
      const descripcion = parts[1];
      const precioStr = parts[parts.length - 1]; // Asumimos que el precio es la última columna

      // 2. Comprobar que el código sea un número (o una cadena que represente un código)
      //    y que el precio sea convertible a un número válido.
      const isCodigoValid = !!codigo && codigo.match(/^\d+$/); // Solo dígitos para el código
      const precio_nuevo = parseFloat(precioStr);
      const isPrecioValid = !isNaN(precio_nuevo) && precio_nuevo > 0;

      // 3. Opcional: Filtramos líneas de encabezado o que sean muy cortas
      const isHeaderLike = isNaN(parseInt(codigo)) && descripcion.length < 5;

      if (isCodigoValid && isPrecioValid && !isHeaderLike) {
        productsToUpdate.push({
          codigo: codigo,
          precio_nuevo: precio_nuevo,
        });
      }
    }
  }

  return productsToUpdate;
}


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
            { message: "No se encontraron productos válidos para actualizar en el CSV." },
            { status: 200 }
        );
    }

    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 2. Recorrer los productos limpios y realizar las actualizaciones
    for (const product of productsToUpdate) {
      const { codigo, precio_nuevo } = product;
      
      // La columna en la base de datos debe ser la que contenga el código de producto,
      // y la columna a actualizar es 'precio'.
      const { error } = await supabase
        .from("productos")
        .update({ precio: precio_nuevo })
        // CAMBIO CLAVE: Usamos 'codigo' para la coincidencia en lugar de 'nombre'
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
  return NextResponse.json({ message: 'GET method not allowed for this endpoint.' }, { status: 405 });
}