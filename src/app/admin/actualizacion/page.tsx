"use client";
import React, { useState } from "react";
import styles from "./actualizacion.module.css";

interface ResultadoActualizacion {
  noEncontrados: string[];
  codigosConflictivos: string[];
  errors: string[];
}

const ActualizarProductos: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [resultado, setResultado] = useState<ResultadoActualizacion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage("");
      setResultado(null);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setIsError(true);
      setMessage("Por favor, selecciona un archivo CSV.");
      return;
    }

    setLoading(true);
    setIsError(false);
    setResultado(null);
    setMessage("Leyendo archivo...");
    try {
      // Enviamos el texto plano del CSV directamente al Route Handler
      const csvContent = await file.text();
      setMessage("Actualizando precios, esto puede tardar unos segundos...");

      const response = await fetch("/actualizar-prods", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: csvContent,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsError((data.errors?.length ?? 0) > 0);
        setResultado({
          noEncontrados: data.noEncontrados ?? [],
          codigosConflictivos: data.codigosConflictivos ?? [],
          errors: data.errors ?? [],
        });
        if (data.errors?.length > 0) {
          console.error("Errores de actualización parcial:", data.errors);
        }
      } else {
        setIsError(true);
        setMessage(
          `Error al actualizar productos: ${data.error || "Error desconocido"}`
        );
      }
    } catch (error) {
      setIsError(true);
      if (error instanceof Error) {
        setMessage(`Error en la solicitud: ${error.message || "Error de red"}`);
      } else {
        setMessage("Ocurrió un error inesperado al procesar el archivo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const listas: { titulo: string; items: string[] }[] = resultado
    ? [
        {
          titulo: "Códigos que no existen en la página",
          items: resultado.noEncontrados,
        },
        {
          titulo:
            "Códigos no actualizados porque los usan productos distintos (hay que corregirles el código)",
          items: resultado.codigosConflictivos,
        },
        { titulo: "Errores", items: resultado.errors },
      ].filter((l) => l.items.length > 0)
    : [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Actualizar Productos por CSV</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fileInputWrapper}>
          <input
            className={styles.fileInput}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            aria-label="Seleccionar archivo CSV"
          />
        </div>
        <button
          className={styles.submitButton}
          type="submit"
          disabled={!file || loading}
          aria-label={
            loading ? "Actualizando productos" : "Subir y actualizar productos"
          }
        >
          {loading ? "Actualizando..." : "Subir y Actualizar"}
        </button>
      </form>

      {message && (
        <div
          className={`${styles.message} ${
            loading ? "" : isError ? styles.error : styles.success
          }`}
        >
          {message}
        </div>
      )}

      {listas.map((lista) => (
        <details key={lista.titulo} className={styles.instructions}>
          <summary className={styles.exampleTitle}>
            {lista.titulo} ({lista.items.length})
          </summary>
          <div className={styles.codeBlock}>
            <code>{lista.items.join(", ")}</code>
          </div>
        </details>
      ))}

      <div className={styles.instructions}>
        <p className={styles.instructionText}>
          El archivo CSV será procesado por el servidor para extraer el código
          de producto (primera columna) y el precio (última columna). Las
          líneas de títulos o encabezados se ignoran solas.
        </p>
        <p className={styles.instructionText}>
          Se aceptan archivos separados por coma (Google Sheets: Archivo →
          Descargar → Valores separados por comas (.csv)) o por punto y coma
          (Excel: Guardar como → CSV).
        </p>
        <p className={styles.instructionText}>
          Los precios pueden venir como <strong>1.851,48</strong>,{" "}
          <strong>1851.48</strong> o <strong>$ 1.851</strong>.
        </p>
        <p className={styles.exampleTitle}>Ejemplos de líneas válidas:</p>
        <div className={styles.codeBlock}>
          <code>
            9809,AA X 2,&quot;1.851,48&quot;
            <br />
            9809;AA X 2;1.851,48
          </code>
        </div>
      </div>
    </div>
  );
};

export default ActualizarProductos;
