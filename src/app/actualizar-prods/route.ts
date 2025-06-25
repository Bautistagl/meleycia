// app/actualizar-productos/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const { products } = await req.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Datos de productos inválidos o vacíos." },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const product of products) {
      const { nombre, precio_nuevo } = product;

      if (!nombre || typeof precio_nuevo !== "number" || isNaN(precio_nuevo)) {
        errors.push(
          `Fila inválida: nombre '${nombre}', precio_nuevo '${precio_nuevo}'`
        );
        errorCount++;
        continue;
      }

      const { error } = await supabase
        .from("productos")
        .update({ precio: precio_nuevo })
        .eq("nombre", nombre);

      if (error) {
        errors.push(`Error al actualizar '${nombre}': ${error.message}`);
        errorCount++;
      } else {
        updatedCount++;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          message: `Actualización completada con errores. Se actualizaron ${updatedCount} productos. ${errorCount} errores.`,
          errors: errors,
        },
        { status: 200 }
      ); // Aunque haya errores parciales, la operación general fue un 200
    } else {
      return NextResponse.json(
        { message: `Se actualizaron ${updatedCount} productos exitosamente.` },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    // Explicitly define as unknown or just 'catch (error)'
    console.error("Error en el Route Handler:", error);

    let errorMessage = "Error desconocido";

    // Perform type narrowing to safely access 'message'
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      // This handles cases where 'error' might be an object with a 'message' property
      // but not necessarily an instance of the Error class (e.g., custom errors or some third-party library errors).
      errorMessage = (error as { message: string }).message;
    } else if (typeof error === "string") {
      // In case the error is a plain string
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

// Puedes añadir otros métodos como PUT, DELETE si los necesitas
// export async function PUT(req: Request) { ... }
// export async function DELETE(req: Request) { ... }