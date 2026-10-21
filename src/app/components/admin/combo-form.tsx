"use client";

import type React from "react";
import styles from "./product-form.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/compressImage";
import { cdnImage } from "@/lib/imageUrl";
import Swal from "sweetalert2";

interface ComboFormProps {
  initialData?: {
    id?: string;
    name?: string;
    price?: number;
    stock?: number;
    descripcion?: string;
    precio_oferta?: number | null;
    imageUrl?: string;
    codigo?: string;
  };
}

// Función auxiliar para formatear un número a formato de moneda (ej: 2.343,33)
const formatMoney = (value: number | null): string => {
  if (value === null || isNaN(value)) {
    return "";
  }
  // Usamos 'es-AR' para obtener el formato de punto para miles y coma para decimales
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Función auxiliar para limpiar un string de moneda y convertirlo a número
const parseMoney = (value: string): number | null => {
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const numericValue = Number.parseFloat(cleaned);
  // Si el valor no es un número válido, devolvemos null
  return isNaN(numericValue) ? null : numericValue;
};

export function ComboForm({ initialData }: ComboFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 1,
    descripcion: initialData?.descripcion || "",
    precio_oferta: initialData?.precio_oferta || null,
    imageUrl: initialData?.imageUrl || "",
    codigo: initialData?.codigo,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl || null
  ); // Estado para la URL de la imagen

  // Estados locales para los valores formateados de los inputs de precio
  const [formattedPrice, setFormattedPrice] = useState(
    formatMoney(initialData?.price || 0)
  );

  // Sincronizar los estados locales con el formData inicial
  useEffect(() => {
    setFormattedPrice(formatMoney(formData.price));
  }, [formData.price]);

  // Obtener marcas y categorías desde Supabase al montar el componente

  // Maneja el cambio en el input de tipo file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImageUrl(initialData?.imageUrl || null);
    }
  };

  // Función para subir la imagen a Supabase Storage
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl;

    // Comprimir antes de subir para reducir cached egress
    const fileToUpload = await compressImage(imageFile, {
      maxWidthOrHeight: 1200,
      quality: 0.82,
      mimeType: "image/webp",
    });

    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const { error } = await supabase.storage
      .from("mele-imagenes")
      .upload(fileName, fileToUpload, {
        // 1 año + immutable: el nombre incluye Date.now() así que el archivo nunca cambia
        cacheControl: "31536000, immutable",
        upsert: false,
        contentType: fileToUpload.type,
      });

    if (error) {
      console.error("Error al subir imagen:", error.message);
      Swal.fire({
        title: "Error al subir imagen",
        text: error.message,
        icon: "error",
      });
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("mele-imagenes")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };
  const [formattedOfferPrice, setFormattedOfferPrice] = useState(
    formatMoney(initialData?.precio_oferta ?? null)
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, price, stock, descripcion, codigo, precio_oferta } = formData;

    let finalImageUrl: string | null = null;

    if (imageFile) {
      finalImageUrl = await uploadImage();
      if (!finalImageUrl) {
        return;
      }
    } else {
      finalImageUrl = initialData?.imageUrl || null;
    }

    let response;
    if (initialData?.id) {
      response = await supabase
        .from("combos")
        .update({
          nombre: name,
          precio: price,
          stock: stock > 0, // Asegura que se guarde como booleano
          descripcion: descripcion,
          precio_oferta: precio_oferta,
          imageUrl: finalImageUrl,
          codigo: codigo,
        })
        .eq("id", initialData.id);
    } else {
      response = await supabase
        .from("combos")
        .insert([
          {
            nombre: name,
            precio: price,
            stock: stock,
            descripcion: descripcion,
            precio_oferta: precio_oferta,
            imageUrl: finalImageUrl,
            codigo: codigo,
          },
        ])
        .select();
    }

    const { error } = response;
    if (error) {
      console.error("Error al guardar producto:", error.message);
      Swal.fire({
        title: "Error",
        text: "Error al guardar el producto: " + error.message,
        icon: "error",
      });
      return;
    }
    console.log(response, "esto es repos");
    Swal.fire({
      title: initialData?.id ? "Producto Actualizado" : "Producto Creado",
      icon: "success",
    });

    if (!initialData?.id) {
      setFormData({
        name: "",
        price: 0,
        stock: 1,
        descripcion: "",
        precio_oferta: 0,
        imageUrl: "",
        codigo: "",
      });
      setImageFile(null);
      setImageUrl(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre del combo
            </label>
            <input
              id="name"
              className={styles.input}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>
                Precio ($)
              </label>
              <input
                id="price"
                className={styles.input}
                type="text" // Cambiado a "text" para el formato de dinero
                value={formattedPrice}
                onChange={(e) => {
                  setFormattedPrice(e.target.value);
                }}
                onBlur={() => {
                  const numericValue = parseMoney(formattedPrice);
                  setFormData({
                    ...formData,
                    price: numericValue ?? 0,
                  });
                  setFormattedPrice(formatMoney(numericValue));
                }}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="stock" className={styles.label}>
                Stock
              </label>
              <select
                id="stock"
                className={styles.select}
                value={formData.stock > 0 ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: e.target.value === "true" ? 1 : 0,
                  })
                }
              >
                <option value="true">Disponible</option>
                <option value="false">No Disponible</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="precio_oferta" className={styles.label}>
                Precio de oferta ($)
              </label>
              <input
                id="precio_oferta"
                className={styles.input}
                type="text" // Cambiado a "text"
                value={formattedOfferPrice}
                onChange={(e) => {
                  setFormattedOfferPrice(e.target.value);
                }}
                onBlur={() => {
                  const numericValue = parseMoney(formattedOfferPrice);
                  setFormData({
                    ...formData,
                    precio_oferta: numericValue,
                  });
                  setFormattedOfferPrice(formatMoney(numericValue));
                }}
                placeholder="Opcional"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Codigo del combo
              </label>
              <input
                id="name"
                className={styles.input}
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Descripcion del combo
              </label>
              <textarea
                id="name"
                className={styles.input}
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.imageUpload}>
            <label htmlFor="image" className={styles.label}>
              Imagen del combo
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            {imageUrl && (
              <div className={styles.imagePreviewContainer}>
                <img
                  src={cdnImage(imageUrl)}
                  alt="Vista previa"
                  className={styles.imagePreview}
                />
              </div>
            )}
            {!imageUrl && (
              <div className={styles.noImagePlaceholder}>
                <p>Selecciona una imagen</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton}>
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton}>
          {initialData?.id ? "Actualizar Combo" : "Crear Combo"}
        </button>
      </div>
    </form>
  );
}
