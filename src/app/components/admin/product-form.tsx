"use client";

import type React from "react";
import styles from "./product-form.module.css";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/compressImage";
import Swal from "sweetalert2";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name?: string;
    category?: string;
    price?: number;
    stock?: number;
    descripcion?: string;
    marca?: string;
    precio_oferta?: number | null;
    imageUrl?: string;
    destacado?: boolean;
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

export function ProductForm({ initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 1,
    descripcion: initialData?.descripcion || "",
    marca: initialData?.marca || "",
    precio_oferta: initialData?.precio_oferta || null,
    imageUrl: initialData?.imageUrl || "",
    destacado: initialData?.destacado || false,
    codigo: initialData?.codigo || "",
  });

  const [brands, setBrands] = useState<
    { id: string | number; marca: string }[]
  >([]);
  const [categorias, setCategorias] = useState<
    { id: string | number; nombre: string }[]
  >([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl || null
  ); // Estado para la URL de la imagen

  // Evita guardar dos veces por doble clic (generaba productos duplicados).
  // El ref bloquea de inmediato; el state es para deshabilitar el botón.
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados locales para los valores formateados de los inputs de precio
  const [formattedPrice, setFormattedPrice] = useState(
    formatMoney(initialData?.price || 0)
  );
  const [formattedOfferPrice, setFormattedOfferPrice] = useState(
    formatMoney(initialData?.precio_oferta ?? null)
  );

  // Sincronizar los estados locales con el formData inicial
  useEffect(() => {
    setFormattedPrice(formatMoney(formData.price));
    setFormattedOfferPrice(formatMoney(formData.precio_oferta));
  }, [formData.price, formData.precio_oferta]);

  // Obtener marcas y categorías desde Supabase al montar el componente
  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase.from("marcas").select("id, marca");
      if (error) {
        console.error("Error fetching brands:", error.message);
        return;
      }
      // ¡CORRECCIÓN AQUÍ! Solo llamas a setBrands una vez con el array de objetos.
      setBrands(data as { id: string | number; marca: string }[]);
    };

    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre");
      if (error) {
        console.error("Error fetching categorias:", error.message);
        return;
      }
      // ¡CORRECCIÓN AQUÍ! Solo llamas a setCategorias una vez con el array de objetos.
      setCategorias(data as { id: string | number; nombre: string }[]);
    };

    fetchCategorias();
    fetchBrands();
  }, []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await saveProduct();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const saveProduct = async () => {
    const {
      name,
      category,
      price,
      stock,
      descripcion,
      marca,
      precio_oferta,
      destacado,
      codigo,
    } = formData;

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
        .from("productos")
        .update({
          nombre: name,
          categoria: category,
          precio: price,
          stock: stock > 0, // Asegura que se guarde como booleano
          descripcion: descripcion,
          marca: marca,
          precio_oferta: precio_oferta,
          imageUrl: finalImageUrl,
          destacado: destacado,
          codigo: codigo.trim(),
        })
        .eq("id", initialData.id);
    } else {
      response = await supabase
        .from("productos")
        .insert([
          {
            nombre: name,
            categoria: category,
            precio: price,
            stock: stock,
            descripcion: descripcion,
            marca: marca,
            precio_oferta: precio_oferta,
            imageUrl: finalImageUrl,
            destacado: destacado,
            codigo: codigo.trim(),
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
        category: "",
        price: 0,
        stock: 1,
        descripcion: "",
        marca: "",
        precio_oferta: 0,
        imageUrl: "",
        destacado: false,
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
              Nombre del producto
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

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Categoria
            </label>
            <select
              id="category"
              className={styles.select}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="" disabled>
                Seleccionar Categoria
              </option>
              {categorias.map(
                (
                  category // Usar el nuevo estado de datos
                ) => (
                  <option key={category.id} value={category.nombre}>
                    {" "}
                    {category.nombre}
                  </option>
                )
              )}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="brand" className={styles.label}>
              Marca
            </label>
            <select
              id="brand"
              className={styles.select}
              value={formData.marca}
              onChange={(e) =>
                setFormData({ ...formData, marca: e.target.value })
              }
            >
              <option value="" disabled>
                Seleccionar Marca
              </option>
              {brands.map(
                (
                  brand // Usar el nuevo estado de datos
                ) => (
                  <option key={brand.id} value={brand.marca}>
                    {" "}
                    {brand.marca}
                  </option>
                )
              )}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="codigo" className={styles.label}>
              Codigo
            </label>
            <input
              id="codigo"
              className={styles.input}
              value={formData.codigo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  codigo: e.target.value,
                })
              }
              placeholder="Ingresar codigo"
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
          <div className={styles.formGroup2}>
            <label htmlFor="destacado" className={styles.label}>
              Producto destacado
            </label>
            <input
              id="destacado"
              type="checkbox"
              checked={formData.destacado}
              onChange={(e) =>
                setFormData({ ...formData, destacado: e.target.checked })
              }
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.imageUpload}>
            <label htmlFor="image" className={styles.label}>
              Imagen del producto
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
                  src={imageUrl}
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
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : initialData?.id
              ? "Actualizar Producto"
              : "Crear Producto"}
        </button>
      </div>
    </form>
  );
}

{
  /* <div className={styles.imagePreview}>
              {formData.image ? (
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt="Product preview"
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <Upload size={32} />
                  <p>Click to upload or drag and drop</p>
                  <span>SVG, PNG, JPG (max. 2MB)</span>
                </div>
              )}
              <input
                id="image"
                type="file"
                className={styles.fileInput}
                onChange={(e) => {
                  // In a real implementation, you would handle file upload here
                  // For now, we'll just use a placeholder
                  if (e.target.files?.length) {
                    setFormData({
                      ...formData,
                      image: "/placeholder.svg?height=300&width=300",
                    });
                  }
                }}
              />
            </div> */
}
