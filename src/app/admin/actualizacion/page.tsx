'use client'
import React, { useState } from 'react';
import Papa from 'papaparse';
import styles from './actualizacion.module.css'
import Image from 'next/image';

interface CsvProductRow {
  nombre: string;
  precio: string; // Se lee como string del CSV, luego se convierte a número
  // Otros campos si fueran necesarios para validación, pero solo usaremos nombre y precio_nuevo
}

const ActualizarProductos: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
 

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage('');
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage('Por favor, selecciona un archivo CSV.');
      return;
    }

    setLoading(true);
    setMessage('Procesando archivo...');

    Papa.parse<CsvProductRow>(file, {
      header: true, // Asume que la primera fila son los encabezados
      skipEmptyLines: true,
      complete: async (results) => {
        const productsToUpdate = results.data.map(row => ({
          nombre: row.nombre,
          precio_nuevo: parseFloat(row.precio) // Convertir el precio a número
        })).filter(p => !isNaN(p.precio_nuevo)); // Filtrar filas con precio inválido

        if (productsToUpdate.length === 0) {
          setMessage('No se encontraron productos válidos para actualizar en el CSV.');
          setLoading(false);
          return;
        }

        try {
          const response = await fetch('/actualizar-prods', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ products: productsToUpdate }),
          });

          const data = await response.json();

          if (response.ok) {
            setMessage(data.message);
          } else {
            setMessage(`Error al actualizar productos: ${data.error || 'Error desconocido'}`);
          }
        } catch (error: any) {
          setMessage(`Error en la solicitud: ${error.message || 'Error de red'}`);
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setMessage(`Error al parsear el CSV: ${error.message}`);
        setLoading(false);
      }
    });
  };

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
          aria-label={loading ? 'Actualizando productos' : 'Subir y actualizar productos'}
        >
          {loading ? 'Actualizando...' : 'Subir y Actualizar'}
        </button>
      </form>

      {message && (
        <div className={`${styles.message} `}>
          {message}
        </div>
      )}

      <div className={styles.instructions}>
        <p className={styles.instructionText}>
          El archivo CSV debe contener las columnas <strong>nombre </strong> y <strong>precio </strong>(ambos en minuscula).
        </p>
         <p className={styles.instructionText}>
          Es obligatorio que la columna <strong>nombre </strong> este primera y <strong>precio </strong> segunda
        </p>
         <p className={styles.instructionText}>
          Es obligatorio que las columnas <strong>nombre </strong> y <strong>precio </strong> se encuentren en la primera fila
        </p>
         <p className={styles.instructionText}>
          Para obtener el archivo csv deben entrar a la lista en excel, tocar archivo, tocar descargar y elegir la opcion Valores separados por coma (.csv) .
        </p>
        
        
        <p className={styles.exampleTitle}>Ejemplo de lista de excel:</p>
        <Image alt='' src='/ejemplo_csv.png' height={180} width={350}/>
        <p className={styles.exampleTitle}>Ejemplo de CSV:</p>
        <div className={styles.codeBlock}>
          <code>
            nombre,precio<br/>
            Producto A,120.50<br/>
            Producto B,25.00
          </code>
        </div>
      </div>
    </div>
  );
};

export default ActualizarProductos;