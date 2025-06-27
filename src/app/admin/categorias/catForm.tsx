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
    nombre: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ nombre: value });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setError("El nombre de la marca es requerido");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const { error: supabaseError } = await supabase
        .from("categorias")
        .insert([{ nombre: formData.nombre }]);

      if (supabaseError) {
        throw supabaseError;
      }

      setSuccessMessage("Marca agregada exitosamente");
      // Reset form
      setFormData({ nombre: "" });
    } catch (error: unknown) {
      // Change 'any' to 'unknown'
      console.error("Error submitting form:", error);

      let errorMessage = "Por favor intenta nuevamente.";

      // Narrow the type of error to provide more specific messages
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        // This handles cases where the error might be an object with a message property,
        // but not necessarily an instance of Error (e.g., from an API response).
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setError(`Error al guardar la marca: ${errorMessage}`);
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

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="marca" className={styles.label}>
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
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
          <button
            type="submit"
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={isLoading}
          >
            {isLoading && <span className={styles.loadingSpinner}></span>}
            {isLoading ? "Guardando..." : "Agregar Categoria"}
          </button>
        </div>
      </form>
    </div>
  );
}
