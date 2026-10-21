import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Las listas grandes hacen muchas actualizaciones: damos margen antes del timeout.
export const maxDuration = 60;

// Cantidad de updates que se mandan en paralelo a Supabase.
const CONCURRENCIA = 25;
// Supabase devuelve como máximo 1000 filas por consulta.
const PAGE_SIZE = 1000;

type FilaCSV = { codigo: string; precio_nuevo: number };
type ProductoDB = { id: number; codigo: string | null; nombre: string | null; precio: number | null };

/**
 * Divide una línea por el separador, respetando valores entre comillas
 * (ej: "1.851,48" en un CSV separado por comas) y comillas escapadas ("").
 */
function splitLinea(linea: string, separador: string): string[] {
  const campos: string[] = [];
  let actual = "";
  let entreComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') {
      if (entreComillas && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else {
        entreComillas = !entreComillas;
      }
    } else if (c === separador && !entreComillas) {
      campos.push(actual.trim());
      actual = "";
    } else {
      actual += c;
    }
  }
  campos.push(actual.trim());
  return campos;
}

/**
 * Google Sheets exporta con coma y Excel en español con punto y coma.
 * Si la mayoría de las líneas tienen ";" usamos ese, si no ",".
 */
function detectarSeparador(lineas: string[]): string {
  const muestra = lineas.slice(0, 20);
  const conPuntoYComa = muestra.filter((l) => l.includes(";")).length;
  return conPuntoYComa > muestra.length / 2 ? ";" : ",";
}

/**
 * Convierte un precio en formato argentino o internacional a número.
 * Ejemplos: "1.851,48" -> 1851.48 | "1851.48" -> 1851.48 | "1.851" -> 1851 | "$ 2.500" -> 2500
 */
function parsePrecio(valor: string): number | null {
  let s = valor.replace(/[^\d.,-]/g, "");
  if (!s) return null;

  const ultimoPunto = s.lastIndexOf(".");
  const ultimaComa = s.lastIndexOf(",");

  if (ultimoPunto !== -1 && ultimaComa !== -1) {
    // Tiene ambos: el que aparece último es el separador decimal
    if (ultimaComa > ultimoPunto) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (ultimaComa !== -1) {
    // Solo comas: "1851,48" es decimal, "1,851" o "1,851,000" son miles
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (ultimoPunto !== -1) {
    // Solo puntos: "1.851" o "1.851.000" son miles, "1851.48" es decimal
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  }

  const numero = Number(s);
  if (!Number.isFinite(numero) || numero <= 0) return null;
  return Math.round(numero * 100) / 100;
}

/**
 * Extrae { codigo, precio_nuevo } de cada línea: el código es la primera
 * columna y el precio la última columna con contenido. Las líneas cuyo
 * precio no es un número (encabezados, títulos, totales) se ignoran.
 */
function parseCSV(csvContent: string): { filas: FilaCSV[]; lineasIgnoradas: number } {
  const lineas = csvContent
    .replace(/^﻿/, "") // BOM que agrega Excel
    .split(/\r?\n|\r/)
    .filter((l) => l.trim() !== "");

  if (lineas.length === 0) return { filas: [], lineasIgnoradas: 0 };

  const separador = detectarSeparador(lineas);
  // Si un código aparece dos veces en el CSV, gana la última línea
  const porCodigo = new Map<string, number>();
  let lineasIgnoradas = 0;

  for (const linea of lineas) {
    const campos = splitLinea(linea, separador);
    const noVacios = campos.filter((c) => c !== "");
    if (noVacios.length < 2) {
      lineasIgnoradas++;
      continue;
    }

    const codigo = campos[0].trim();
    const precio = parsePrecio(noVacios[noVacios.length - 1]);
    if (!codigo || precio === null) {
      lineasIgnoradas++;
      continue;
    }
    porCodigo.set(codigo, precio);
  }

  const filas = Array.from(porCodigo, ([codigo, precio_nuevo]) => ({ codigo, precio_nuevo }));
  return { filas, lineasIgnoradas };
}

async function traerProductos(): Promise<ProductoDB[]> {
  const productos: ProductoDB[] = [];
  for (let desde = 0; ; desde += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("productos")
      .select("id, codigo, nombre, precio")
      .order("id")
      .range(desde, desde + PAGE_SIZE - 1);
    if (error) throw new Error(`No se pudieron leer los productos: ${error.message}`);
    productos.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return productos;
}

const normalizarNombre = (n: string | null) => (n ?? "").trim().toLowerCase();

export async function POST(req: Request) {
  try {
    const csvContent = await req.text();

    if (!csvContent) {
      return NextResponse.json(
        { error: "Contenido del archivo CSV vacío o no proporcionado." },
        { status: 400 }
      );
    }

    const { filas, lineasIgnoradas } = parseCSV(csvContent);

    if (filas.length === 0) {
      return NextResponse.json(
        {
          message:
            "No se encontraron productos válidos en el CSV. Revisá que la primera columna sea el código y la última el precio.",
        },
        { status: 200 }
      );
    }

    // Traemos todos los productos una sola vez para saber qué códigos existen
    const productos = await traerProductos();
    const productosPorCodigo = new Map<string, ProductoDB[]>();
    for (const p of productos) {
      const codigo = (p.codigo ?? "").trim();
      if (!codigo) continue;
      const lista = productosPorCodigo.get(codigo) ?? [];
      lista.push(p);
      productosPorCodigo.set(codigo, lista);
    }

    const noEncontrados: string[] = [];
    const codigosConflictivos: string[] = [];
    let sinCambios = 0;
    const actualizaciones: { codigo: string; ids: number[]; precio: number }[] = [];

    for (const { codigo, precio_nuevo } of filas) {
      const coincidencias = productosPorCodigo.get(codigo);
      if (!coincidencias) {
        noEncontrados.push(codigo);
        continue;
      }

      // Varios productos con el mismo código: si son el mismo producto duplicado
      // se actualizan todos; si son productos distintos no se toca ninguno,
      // para no ponerle a uno el precio del otro.
      const nombres = new Set(coincidencias.map((p) => normalizarNombre(p.nombre)));
      if (nombres.size > 1) {
        codigosConflictivos.push(codigo);
        continue;
      }

      const aActualizar = coincidencias.filter((p) => Number(p.precio) !== precio_nuevo);
      if (aActualizar.length === 0) {
        sinCambios++;
        continue;
      }
      actualizaciones.push({ codigo, ids: aActualizar.map((p) => p.id), precio: precio_nuevo });
    }

    let actualizados = 0;
    const errors: string[] = [];

    for (let i = 0; i < actualizaciones.length; i += CONCURRENCIA) {
      const tanda = actualizaciones.slice(i, i + CONCURRENCIA);
      const resultados = await Promise.all(
        tanda.map(({ ids, precio }) =>
          supabase.from("productos").update({ precio }).in("id", ids).select("id")
        )
      );
      resultados.forEach(({ data, error }, j) => {
        if (error) {
          errors.push(`Error al actualizar código '${tanda[j].codigo}': ${error.message}`);
        } else if (!data || data.length === 0) {
          errors.push(`El código '${tanda[j].codigo}' no se actualizó (sin permisos o borrado).`);
        } else {
          actualizados++;
        }
      });
    }

    const partes = [`Se actualizaron ${actualizados} productos.`];
    if (sinCambios > 0) partes.push(`${sinCambios} ya tenían el mismo precio.`);
    if (noEncontrados.length > 0) partes.push(`${noEncontrados.length} códigos no existen en la página.`);
    if (codigosConflictivos.length > 0)
      partes.push(
        `${codigosConflictivos.length} códigos no se actualizaron porque los usan productos distintos.`
      );
    if (errors.length > 0) partes.push(`${errors.length} errores.`);

    return NextResponse.json(
      {
        message: partes.join(" "),
        actualizados,
        sinCambios,
        noEncontrados,
        codigosConflictivos,
        lineasIgnoradas,
        errors,
      },
      { status: 200 }
    );
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
