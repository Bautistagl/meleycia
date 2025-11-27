"use client";

import type React from "react";
import { useState, useEffect } from "react";
import styles from "./brand.module.css";
import type { BrandFormData } from "@/types";
import { supabase } from "@/lib/supabase";

interface BrandUploadFormProps {
  onCancel?: () => void;
  id?: number;
  name?: string;
  oldName?: string;
}

export default function BrandUploadForm({
  onCancel,
  id,
  name,
  oldName,
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
      if (id) {
        const { error: updateError } = await supabase
          .from("marcas")
          .update({ marca: formData.marca })
          .eq("id", id);

        if (updateError) throw updateError;

        if (oldName) {
          const { error: propiedadesError } = await supabase
            .from("productos")
            .update({ marca: formData.marca })
            .eq("marca", oldName);

          if (propiedadesError) throw propiedadesError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("marcas")
          .insert([{ marca: formData.marca }]);

        if (insertError) throw insertError;
      }

      setSuccessMessage(
        id ? "Marca actualizada exitosamente" : "Marca agregada exitosamente"
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
    if (onCancel) onCancel();
  };

  const formTitle = id ? "Editar Marca" : "Agregar Nueva Marca";
  const submitButtonText = id ? "Guardar Cambios" : "Agregar Marca";

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
          <label htmlFor="marca" className={styles.label}>
            Nombre *
          </label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Ingresa el nombre de la marca"
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
