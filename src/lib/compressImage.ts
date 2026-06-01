// src/lib/compressImage.ts
// Comprime y redimensiona imágenes en el cliente antes de subirlas a Storage.
// No agrega dependencias: usa solo <canvas>.
//
// Mantiene la calidad visual: por defecto recorta a 1200px (lado mayor)
// y exporta a WebP a calidad ~0.82. Para una foto típica de celular esto
// reduce el archivo entre 5x y 20x sin diferencia visual perceptible en
// las tarjetas de producto.

export interface CompressOptions {
  maxWidthOrHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

/**
 * Comprime un File de imagen. Si el archivo ya es pequeño y angosto,
 * lo devuelve tal cual (sin reprocesar) para no perder calidad innecesariamente.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidthOrHeight = 1200,
    quality = 0.82,
    mimeType = "image/webp",
  } = options;

  // Si no es imagen, devolver tal cual
  if (!file.type.startsWith("image/")) return file;

  // Si es SVG o GIF, no tocarlos (transparencias/animación)
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  // Si ya pesa menos de 200KB, no vale la pena recomprimir
  if (file.size < 200 * 1024) return file;

  try {
    const dataUrl = await fileToDataUrl(file);
    const img = await loadImage(dataUrl);

    const { width, height } = scaleDimensions(
      img.naturalWidth,
      img.naturalHeight,
      maxWidthOrHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, mimeType, quality)
    );

    if (!blob) return file;

    // Si por algún motivo el resultado es mayor que el original, mantener el original
    if (blob.size >= file.size) return file;

    const ext = mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const newName = `${baseName}.${ext}`;

    return new File([blob], newName, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("compressImage: fallback al archivo original", err);
    return file;
  }
}

function scaleDimensions(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}
