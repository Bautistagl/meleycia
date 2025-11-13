// components/BrandUploadForm.tsx

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import styles from "../marcas/brand.module.css";
import type { BrandFormData } from "@/types";
import { supabase } from "@/lib/supabase";

interface BrandUploadFormProps {
  onCancel?: () => void;
  id?: number;
  name?: string;
}

export default function BrandUploadForm({
  onCancel,
  id,
  name,
}: BrandUploadFormProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    marca: name || "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (name !== undefined && name !== formData.marca) {
      setFormData({ marca: name });
    }
  }, [name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ marca: value });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.marca.trim()) {
      setError("El nombre de la marca es requerido");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      let supabaseError;

      if (id) {
        const { error: updateError } = await supabase
          .from("categorias")
          .update({ nombre: formData.marca })
          .eq("id", id);

        supabaseError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("categorias")
          .insert([{ nombre: formData.marca }]);

        supabaseError = insertError;
      }

      if (supabaseError) {
        throw supabaseError;
      }

      setSuccessMessage(
        id
          ? "Categoria actualizada exitosamente"
          : "Categoria agregada exitosamente"
      );

      if (!id) {
        setFormData({ marca: "" });
      }
    } catch (error: unknown) {
      console.error("Error submitting form:", error);

      let errorMessage = "Por favor intenta nuevamente.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
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

  const formTitle = id ? "Editar Categoria" : "Agregar Nueva Categoria";
  const submitButtonText = id ? "Guardar Cambios" : "Agregar Categoria";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{formTitle}</h1>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="categoria" className={styles.label}>
            Nombre *
          </label>
          <input
            type="text"
            id="categoria"
            name="categoria"
            value={formData.marca}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Ingresa el nombre de la categoria"
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
            {isLoading
              ? id
                ? "Guardando..."
                : "Agregando..."
              : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}
