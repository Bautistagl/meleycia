// Las imágenes se guardan en la base con la URL pública de Supabase Storage.
// Para no pagar egress de Supabase, se sirven a través del worker de Cloudflare,
// que recibe el mismo path del archivo dentro del bucket "mele-imagenes".

const BUCKET = "mele-imagenes";
const SUPABASE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
const IMAGE_CDN_URL = (
  process.env.NEXT_PUBLIC_IMAGE_CDN_URL ||
  "https://odd-union-553e.bautistagonzalezlazo.workers.dev"
).replace(/\/+$/, "");

/**
 * Convierte una URL de Supabase Storage en la URL del worker.
 * Cualquier otra URL (placeholders, /public, blobs de vista previa) se devuelve igual.
 */
export function cdnImage(url: string): string;
export function cdnImage(url: string | null | undefined): string | null | undefined;
export function cdnImage(url: string | null | undefined) {
  if (!url || !url.startsWith(SUPABASE_PREFIX)) return url;
  // El worker ignora el query string, así que lo descartamos
  const path = url.slice(SUPABASE_PREFIX.length).split("?")[0];
  return `${IMAGE_CDN_URL}/${path}`;
}
