"use client";

import type React from "react";
import styles from "./product-form.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name?: string;
    category?: string;
    price?: number;
    stock?: number;
    description?: string;
    marca?: string;
    precio_oferta?: number | null;
    imageUrl?: string;
    destacado?: boolean;
    codigo?: string;
  };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 1,
    description: initialData?.description || "",
    marca: initialData?.marca || "",
    precio_oferta: initialData?.precio_oferta ?? 0,
    imageUrl: initialData?.imageUrl || "",
    destacado: initialData?.destacado || false,
    codigo: initialData?.codigo || "",
  });
  const [brands, setBrands] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl || null
  ); // Estado para la URL de la imagen

  // Obtener marcas desde Supabase al montar el componente
  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase.from("marcas").select("marca");
      if (error) {
        console.error("Error fetching brands:", error.message);
        return;
      }

      setBrands(data.map((b) => b.marca));
    };
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("nombre");
      if (error) {
        console.error("Error fetching categorias:", error.message);
        return;
      }

      setCategorias(data.map((b) => b.nombre));
    };

    fetchCategorias();
    fetchBrands();
  }, []);
  // Maneja el cambio en el input de tipo file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Previsualiza la imagen si es necesario
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImageUrl(initialData?.imageUrl || null);
    }
  };

  // Función para subir la imagen a Supabase Storage
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl; // Si no hay nuevo archivo, devuelve la URL existente

    const fileName = `${Date.now()}-${imageFile.name}`;
    const { error } = await supabase.storage
      .from("mele-imagenes") // Reemplaza 'product-images' con el nombre de tu bucket
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false, // Asegúrate de que no sobrescriba si ya existe un archivo con el mismo nombre
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

    // Obtener la URL pública de la imagen
    const { data: publicUrlData } = supabase.storage
      .from("mele-imagenes")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      name,
      category,
      price,
      stock,
      description,
      marca,
      precio_oferta,
      destacado,
      codigo,
    } = formData;

    let finalImageUrl: string | null = null;

    // Solo intenta subir una imagen si hay un archivo nuevo seleccionado
    if (imageFile) {
      finalImageUrl = await uploadImage();
      if (!finalImageUrl) {
        // Si se intentó subir una imagen nueva pero falló, detén el proceso
        return;
      }
    } else {
      // Si no hay un nuevo archivo de imagen, usa la URL existente (original del producto o null)
      finalImageUrl = initialData?.imageUrl || null;
    }

    let response;
    if (initialData?.id) {
      // Actualizar producto
      response = await supabase
        .from("productos")
        .update({
          nombre: name,
          categoria: category,
          precio: price,
          stock: stock > 0,
          descripcion: description,
          marca: marca,
          precio_oferta: precio_oferta,
          imageUrl: finalImageUrl,
          destacado: destacado,
          codigo: codigo,
        })
        .eq("id", initialData.id);
    } else {
      // Crear nuevo producto
      response = await supabase.from("productos").insert([
        {
          nombre: name,
          categoria: category,
          precio: price,
          stock: stock,
          descripcion: description,
          marca: marca,
          precio_oferta: precio_oferta,
          imageUrl: finalImageUrl,
          destacado: destacado,
          codigo: codigo,
        },
      ]);
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
        description: "",
        marca: "",
        precio_oferta: 0,
        imageUrl: "",
        destacado: false,
        codigo: "",
      });
      setImageFile(null); // Limpiar el archivo de imagen
      setImageUrl(null); // Limpiar la URL de la imagen
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
                  category // Cambiado 'brand' a 'category' para mayor claridad
                ) => (
                  <option key={category} value={category}>
                    {category}
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
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="precio_oferta" className={styles.label}>
              Codigo
            </label>
            <input
              id="precio_oferta"
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
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price:
                      e.target.value === ""
                        ? 0
                        : Number.parseFloat(e.target.value), // Or null, depending on your preference
                  })
                }
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="stock" className={styles.label}>
                {" "}
                {/* Cambiado id de category a stock */}
                Stock
              </label>
              <select
                id="stock" // Cambiado id de category a stock
                className={styles.select}
                value={formData.stock > 0 ? "true" : "false"}
                onChange={
                  (e) =>
                    setFormData({
                      ...formData,
                      stock: e.target.value === "true" ? 1 : 0,
                    }) // Convierte a número para el estado
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
              type="number"
              min="0"
              step="0.01"
              value={formData.precio_oferta}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  precio_oferta:
                    e.target.value === ""
                      ? 0
                      : Number.parseFloat(e.target.value),
                })
              }
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
              className={styles.fileInput} // Agrega una clase para estilizar el input de archivo
            />
            {/* Visualización de la imagen */}
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
        <button type="submit" className={styles.submitButton}>
          {initialData?.id ? "Actualizar Producto" : "Crear Producto"}
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
