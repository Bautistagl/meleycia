-- ============================================================================
-- Actualizar el cache-control de las imágenes existentes en el bucket
-- "mele-imagenes" para que la CDN las cachee 1 año en vez de 1 hora.
--
-- Cómo ejecutarlo:
--   1. Entrá al panel de Supabase: https://supabase.com/dashboard
--   2. Elegí el proyecto.
--   3. En el menú lateral abrí "SQL Editor".
--   4. "New query", pegá TODO este archivo y apretá "Run".
--
-- Es seguro correrlo varias veces: el UPDATE sólo sobreescribe el valor
-- de cacheControl en la metadata, sin tocar los archivos.
-- ============================================================================


-- Paso 1 (diagnóstico): ver cuántos archivos hay y con qué cache-control están
-- ----------------------------------------------------------------------------
SELECT
  COUNT(*)                                       AS total_archivos,
  COALESCE(metadata->>'cacheControl', '(vacío)') AS cache_control_actual
FROM storage.objects
WHERE bucket_id = 'mele-imagenes'
GROUP BY metadata->>'cacheControl'
ORDER BY total_archivos DESC;


-- Paso 2: actualizar la metadata para que la CDN cachee 1 año + immutable
-- ----------------------------------------------------------------------------
UPDATE storage.objects
SET    metadata = metadata
                  || jsonb_build_object('cacheControl', 'max-age=31536000, immutable')
WHERE  bucket_id = 'mele-imagenes'
  AND  COALESCE(metadata->>'cacheControl', '') <> 'max-age=31536000, immutable';


-- Paso 3 (verificación): tras correr el UPDATE deberías ver una sola fila
-- con cache_control_actual = 'max-age=31536000, immutable'
-- ----------------------------------------------------------------------------
SELECT
  COUNT(*)                                       AS total_archivos,
  COALESCE(metadata->>'cacheControl', '(vacío)') AS cache_control_actual
FROM storage.objects
WHERE bucket_id = 'mele-imagenes'
GROUP BY metadata->>'cacheControl';
