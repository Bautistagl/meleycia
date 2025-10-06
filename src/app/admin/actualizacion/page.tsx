"use client";
import React, { useState } from "react";
import styles from "./actualizacion.module.css";




const ActualizarProductos: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage("");
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage("Por favor, selecciona un archivo CSV.");
      return;
    }

    setLoading(true);
    setMessage("Leyendo archivo...");
    try {
      // CAMBIO CLAVE: Leer el contenido del archivo como texto plano
      const csvContent = await file.text();
      setMessage("Enviando datos al servidor para procesamiento..."); // Enviar el texto plano del CSV directamente al Route Handler

      const response = await fetch("/actualizar-prods", {
        method: "POST",
        headers: {
          // CAMBIO CLAVE: Usamos 'text/plain' para el contenido del CSV
          "Content-Type": "text/plain",
        }, // CAMBIO CLAVE: Enviamos el contenido raw del archivo
        body: csvContent,
      });

      const data = await response.json();

      if (response.ok) {
        // Si hay errores parciales, mostramos el mensaje general y un log
        if (data.errors && data.errors.length > 0) {
          setMessage(
            data.message + " (Ver errores en la consola del navegador)"
          );
          console.error("Errores de actualización parcial:", data.errors);
        } else {
          setMessage(data.message);
        }
      } else {
        setMessage(
          `Error al actualizar productos: ${data.error || "Error desconocido"}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error en la solicitud: ${error.message || "Error de red"}`);
      } else {
        setMessage("Ocurrió un error inesperado al procesar el archivo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
            <h1 className={styles.title}>Actualizar Productos por CSV</h1>     
           {" "}
      <form className={styles.form} onSubmit={handleSubmit}>
               {" "}
        <div className={styles.fileInputWrapper}>
                   {" "}
          <input
            className={styles.fileInput}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            aria-label="Seleccionar archivo CSV"
          />
                 {" "}
        </div>
                       {" "}
        <button
          className={styles.submitButton}
          type="submit"
          disabled={!file || loading}
          aria-label={
            loading ? "Actualizando productos" : "Subir y actualizar productos"
          }
        >
                    {loading ? "Actualizando..." : "Subir y Actualizar"}       {" "}
        </button>
             {" "}
      </form>
           {" "}
      {message && (
        <div className={`${styles.message} `}>          {message}        </div>
      )}
           {" "}
      <div className={styles.instructions}>
               {" "}
        <p className={styles.instructionText}>
                    El archivo CSV será procesado por el servidor para extraer
          el código de producto (primera columna) y el precio (última columna).
                 {" "}
        </p>
               {" "}
        <p className={styles.instructionText}>
                    La estructura de línea esperada es similar a:{" "}
          <strong>Código, Descripción, ..., Precio</strong>.        {" "}
        </p>
               {" "}
        <p className={styles.instructionText}>
                    Para obtener el archivo csv deben entrar a la lista en
          excel, tocar archivo, tocar descargar y elegir la opción **Valores
          separados por coma (.csv)**.        {" "}
        </p>
                       {" "}
        <p className={styles.exampleTitle}>Ejemplo de línea válida:</p>       {" "}
        <div className={styles.codeBlock}>
                    <code>            9809, AA X 2,48,1851.48           </code> 
               {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default ActualizarProductos;
