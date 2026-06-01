// scripts/migrate-storage-images.mjs
//
// Recorre el bucket "mele-imagenes" en Supabase Storage, descarga cada imagen,
// la redimensiona/comprime con sharp (WebP, máx 1200px de lado, calidad 82) y
// la re-sube en su mismo path con cache-control de 1 año + immutable.
//
// Pensado para correr una sola vez para limpiar imágenes viejas grandes y
// bajar cached egress. Es idempotente: si una imagen ya está chica y con
// cache-control largo, la omite.
//
// Cómo correrlo: ver scripts/README.md o las instrucciones que te pasé.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import "dotenv/config";

// --- Configuración ----------------------------------------------------------

const BUCKET = "mele-imagenes";
const MAX_DIMENSION = 1200; // píxeles, lado mayor
const WEBP_QUALITY = 82;
const SKIP_BELOW_BYTES = 200 * 1024; // 200 KB: si ya pesa menos, no toco
const NEW_CACHE_CONTROL = "31536000, immutable";
const CONCURRENCY = 3; // procesos en paralelo
const DRY_RUN = process.argv.includes("--dry-run");

// --- Setup ------------------------------------------------------------------

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Falta SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL) o SUPABASE_SERVICE_ROLE_KEY en el .env"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// --- Helpers ----------------------------------------------------------------

function fmtBytes(b) {
  if (b > 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + " MB";
  if (b > 1024) return (b / 1024).toFixed(1) + " KB";
  return b + " B";
}

async function listAll(prefix = "") {
  const all = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const item of data) {
      if (item.id === null) {
        // Carpeta: bajar recursivamente
        const sub = await listAll(prefix ? `${prefix}/${item.name}` : item.name);
        all.push(...sub);
      } else {
        all.push({
          ...item,
          path: prefix ? `${prefix}/${item.name}` : item.name,
        });
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function processOne(obj) {
  const path = obj.path;
  const sizeBytes = obj.metadata?.size ?? 0;
  const cacheControl = obj.metadata?.cacheControl ?? "";
  const mimetype = (obj.metadata?.mimetype ?? "").toLowerCase();

  // Filtros: no imagen, gif, svg → omitir
  if (
    !mimetype.startsWith("image/") ||
    mimetype === "image/gif" ||
    mimetype === "image/svg+xml"
  ) {
    return { path, skipped: `tipo no compresible (${mimetype || "?"})` };
  }

  // Ya está optimizado
  if (
    sizeBytes > 0 &&
    sizeBytes < SKIP_BELOW_BYTES &&
    cacheControl.includes("31536000")
  ) {
    return { path, skipped: "ya optimizado" };
  }

  // Descargar
  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(path);
  if (dlErr) return { path, error: `download: ${dlErr.message}` };

  const origBuf = Buffer.from(await blob.arrayBuffer());

  // Comprimir con sharp
  let processed;
  try {
    processed = await sharp(origBuf)
      .rotate() // respetar orientación EXIF
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch (e) {
    return { path, error: `sharp: ${e.message}` };
  }

  // Si por algún motivo la nueva versión es igual o mayor, mantener original
  // pero actualizar el cache-control con un re-upload del archivo original.
  const useOriginal = processed.length >= origBuf.length;
  const finalBuf = useOriginal ? origBuf : processed;
  const finalType = useOriginal ? mimetype : "image/webp";

  if (DRY_RUN) {
    return {
      path,
      action: useOriginal ? "solo cache-control" : "comprimir",
      origSize: origBuf.length,
      newSize: finalBuf.length,
    };
  }

  // Subir en el mismo path con upsert:true
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, finalBuf, {
      cacheControl: NEW_CACHE_CONTROL,
      upsert: true,
      contentType: finalType,
    });

  if (upErr) return { path, error: `upload: ${upErr.message}` };

  return {
    path,
    action: useOriginal ? "solo cache-control" : "comprimida",
    origSize: origBuf.length,
    newSize: finalBuf.length,
  };
}

// --- Main -------------------------------------------------------------------

async function main() {
  console.log(
    `\n${DRY_RUN ? "[DRY RUN] " : ""}Listando archivos del bucket "${BUCKET}"...\n`
  );
  const files = await listAll();
  console.log(`Total: ${files.length} archivos\n`);

  const stats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    bytesBefore: 0,
    bytesAfter: 0,
  };

  let i = 0;
  async function worker() {
    while (i < files.length) {
      const idx = i++;
      const file = files[idx];
      let result;
      try {
        result = await processOne(file);
      } catch (e) {
        result = { path: file.path, error: e.message ?? String(e) };
      }

      const prefix = `[${String(idx + 1).padStart(
        String(files.length).length,
        " "
      )}/${files.length}]`;

      if (result.error) {
        console.log(`${prefix} ✗ ${result.path} → ERROR ${result.error}`);
        stats.errors++;
      } else if (result.skipped) {
        console.log(`${prefix} · ${result.path} → ${result.skipped}`);
        stats.skipped++;
      } else {
        const saved =
          result.origSize > 0
            ? ((result.origSize - result.newSize) / result.origSize) * 100
            : 0;
        console.log(
          `${prefix} ✓ ${result.path} → ${result.action} ${fmtBytes(
            result.origSize
          )} → ${fmtBytes(result.newSize)} (-${saved.toFixed(0)}%)`
        );
        stats.processed++;
        stats.bytesBefore += result.origSize;
        stats.bytesAfter += result.newSize;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const totalSaved = stats.bytesBefore - stats.bytesAfter;
  const savedPct =
    stats.bytesBefore > 0
      ? ((totalSaved / stats.bytesBefore) * 100).toFixed(1)
      : "0";

  console.log(`\n--- Resumen ---`);
  console.log(`Procesados: ${stats.processed}`);
  console.log(`Omitidos:   ${stats.skipped}`);
  console.log(`Errores:    ${stats.errors}`);
  console.log(`Tamaño total antes:   ${fmtBytes(stats.bytesBefore)}`);
  console.log(`Tamaño total después: ${fmtBytes(stats.bytesAfter)}`);
  console.log(`Ahorro: ${fmtBytes(totalSaved)} (-${savedPct}%)`);

  if (DRY_RUN) {
    console.log(
      `\n(DRY RUN: no se subió ni se modificó nada. Corré el script sin --dry-run para aplicar.)`
    );
  }
}

main().catch((e) => {
  console.error("ERROR FATAL:", e);
  process.exit(1);
});
