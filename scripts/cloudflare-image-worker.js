// Worker de Cloudflare que sirve las imágenes de productos desde R2.
//
// R2 funciona como espejo de Supabase Storage: si la imagen ya está en R2 se
// devuelve desde ahí (R2 no cobra egress). Si no está, se pide UNA sola vez a
// Supabase, se guarda en R2 y se devuelve. Así Supabase entrega cada imagen
// una única vez en total, no una vez por visitante.
//
// Funciona en *.workers.dev (no necesita dominio propio).
//
// Configuración en el panel de Cloudflare:
//   1. R2 → Create bucket → nombre "mele-imagenes".
//   2. Workers → este worker → Settings → Bindings → Add → R2 bucket:
//      Variable name = IMAGENES, bucket = mele-imagenes.
//   3. Pegar este código y Deploy.
//
// Para verificar: pedir la misma imagen dos veces y mirar el header
// x-worker-cache: la primera puede decir MISS, la segunda tiene que decir HIT.

const PROYECTO = "oyhqvqwuhewbspjdvdfk";
const BUCKET = "mele-imagenes";
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function respuestaDesdeR2(objeto, estado, esHead) {
  const headers = new Headers();
  objeto.writeHttpMetadata(headers);
  headers.set("ETag", objeto.httpEtag);
  headers.set("Cache-Control", CACHE_CONTROL);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("x-worker-cache", estado);
  return new Response(esHead ? null : objeto.body, { headers });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }
    const esHead = request.method === "HEAD";

    const url = new URL(request.url);
    // Mismo path que dentro del bucket de Supabase (sin la barra inicial)
    const clave = decodeURIComponent(url.pathname.slice(1));
    if (!clave) return new Response("Not found", { status: 404 });

    const enR2 = await env.IMAGENES.get(clave);
    if (enR2) return respuestaDesdeR2(enR2, "HIT", esHead);

    const origen = `https://${PROYECTO}.supabase.co/storage/v1/object/public/${BUCKET}${url.pathname}`;
    const respuesta = await fetch(origen);

    // Si no existe el archivo, no lo guardamos
    if (!respuesta.ok) {
      return new Response("Not found", { status: respuesta.status });
    }

    const contentType =
      respuesta.headers.get("content-type") || "application/octet-stream";
    const cuerpo = await respuesta.arrayBuffer();

    const headers = {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
      "Access-Control-Allow-Origin": "*",
      "x-worker-cache": "MISS",
    };

    // Guardamos una copia aparte en R2 antes de responder: la respuesta
    // consume el buffer, y si se comparte el put falla sin avisar.
    // Esto sólo demora la primera vez que se pide cada imagen.
    try {
      await env.IMAGENES.put(clave, cuerpo.slice(0), {
        httpMetadata: { contentType, cacheControl: CACHE_CONTROL },
      });
    } catch (error) {
      headers["x-worker-error"] = String(error).slice(0, 200);
    }

    return new Response(esHead ? null : cuerpo, { headers });
  },
};
