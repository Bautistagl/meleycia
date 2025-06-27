// components/BrandUploadForm.tsx (or your BrandUploadForm file)
"use client";

import type React from "react";
import { useState } from "react";
import styles from "../marcas/brand.module.css";

import { supabase } from "@/lib/supabase";
import { CatFormData } from "@/types";


interface BrandUploadFormProps {
  onCancel?: () => void;
}

export default function BrandUploadForm({ onCancel }: BrandUploadFormProps) {
  const [formData, setFormData] = useState<CatFormData>({
    nombre: "", // Changed from 'name' to 'marca'
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ nombre: value }); // Changed from 'name' to 'marca'

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) { // Changed from 'name' to 'marca'
      setError("El nombre de la marca es requerido");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const {  error: supabaseError } = await supabase
        .from("categorias") // Specify the table name
        .insert([{ nombre: formData.nombre }]); // Insert the 'marca' value

      if (supabaseError) {
        throw supabaseError;
      }

      setSuccessMessage("Marca agregada exitosamente");
      // Reset form
      setFormData({ nombre: "" }); // Changed from 'name' to 'marca'
    } catch (error: any) { // Type 'error' as 'any' for now to catch different error types
      console.error("Error submitting form:", error);
      setError(`Error al guardar la marca: ${error.message || "Por favor intenta nuevamente."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Agregar Nueva Categoria</h1>
      </div>

      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="marca" className={styles.label}> {/* Changed from 'name' to 'marca' */}
            Nombre *
          </label>
          <input
            type="text"
            id="nombre" // Changed from 'name' to 'nombre'
            name="nombre" // Changed from 'name' to 'marca'
            value={formData.nombre} // Changed from 'name' to 'marca'
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Ingresa el nombre de la Categoria"
            required
          />
          {error && <span className={styles.errorMessage}>{error}</span>}
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleCancel}
            className={`${styles.button} ${styles.buttonSecondary}`}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isLoading}>
            {isLoading && <span className={styles.loadingSpinner}></span>}
            {isLoading ? "Guardando..." : "Agregar Categoria"}
          </button>
        </div>
      </form>
    </div>
  );
}