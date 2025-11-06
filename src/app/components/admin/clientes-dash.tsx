"use client";
import React, { useState, useEffect } from "react";
import styles from "./ClientsTable.module.css";
import { supabase } from "@/lib/supabase";
// Importa el cliente de Supabase (asume esta ruta, ajústala si es necesario)

// Define la interfaz para los datos de un cliente
interface Client {
  id: string;
  created_at: string;
  nombre: string;
  email: string;
  telefono: string;
  dni: string;
  direccion: string;
  vendedor: string | null; // Puede ser null si no está asignado
  telefono_vendedor: number | null; // Nuevo campo para el teléfono del vendedor
}

// Define la interfaz para los datos de un vendedor (AÑADIMOS 'telefono')
interface Vendedor {
  id: number; // Asume que tienes un ID para el vendedor
  nombre: string; // El nombre que se mostrará en el select
  telefono: number; // El teléfono que se guardará en la tabla clientes
}

const ClientsTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para actualizar el vendedor de un cliente en Supabase
  const handleVendedorChange = async (
    clientId: string,
    selectedVendedorName: string
  ) => {
    // 1. Encontrar el objeto vendedor completo (incluyendo el teléfono)
    // Si selectedVendedorName es '', se desasigna.
    const selectedVendedor = vendedores.find(
      (v) => v.nombre === selectedVendedorName
    );

    // Datos a actualizar en la tabla 'clientes'
    const updateData: {
      vendedor: string | null;
      telefono_vendedor: number | null;
    } = {
      vendedor: selectedVendedor ? selectedVendedor.nombre : null,
      telefono_vendedor: selectedVendedor ? selectedVendedor.telefono : null,
    };

    try {
      // Optimización de la interfaz: actualiza el estado local inmediatamente
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === clientId ? { ...client, ...updateData } : client
        )
      );

      // 2. Ejecuta la actualización en la base de datos (Afectando ambas columnas)
      const { error } = await supabase
        .from("clientes")
        .update(updateData) // Usa el objeto de datos que contiene nombre y teléfono
        .eq("id", clientId);

      if (error) {
        throw error;
      }
      console.log(
        `Cliente ${clientId} actualizado. Vendedor: ${updateData.vendedor}, Teléfono: ${updateData.telefono_vendedor}`
      );
    } catch (e) {
      console.error("Error al actualizar el vendedor:", e);
      setError(`Error al actualizar el vendedor: ${(e as Error).message}`);
      // En un entorno real, aquí querrías revertir el estado local
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Obtener la lista de clientes
        const { data: clientsData, error: clientsError } = await supabase
          .from("clientes")
          .select("*"); // Incluye 'vendedor' y 'telefono_vendedor'

        if (clientsError) {
          throw clientsError;
        }

        // 2. Obtener la lista de vendedores (Ahora incluimos 'telefono')
        const { data: vendorsData, error: vendorsError } = await supabase
          .from("vendedores")
          .select("id, nombre, telefono") // ¡IMPORTANTE: Añadir 'telefono'!
          .order("nombre", { ascending: true });

        if (vendorsError) {
          throw vendorsError;
        }

        setClients(clientsData as Client[]);
        setVendedores(vendorsData as Vendedor[]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Lógica de renderizado ---

  if (loading) {
    return <div className={styles.loading}>Cargando datos...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>Error al cargar los datos: {error}</div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lista de clientes</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>DNI</th>
            <th>Dirección</th>
            <th>Vendedor</th>
            <th>Tel. Vendedor</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((clientItem) => (
            <tr key={clientItem.id}>
              <td>{clientItem.nombre}</td>
              <td>{clientItem.email}</td>
              <td>{clientItem.telefono}</td>
              <td>{clientItem.dni}</td>
              <td>{clientItem.direccion}</td>
              <td>
                <select
                  value={clientItem.vendedor || ""} // Si es null, usa '' para que se seleccione 'Sin Asignar'
                  onChange={(e) =>
                    handleVendedorChange(clientItem.id, e.target.value)
                  }
                >
                  <option value="">--- Sin Asignar ---</option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor.id} value={vendedor.nombre}>
                      {vendedor.nombre}
                    </option>
                  ))}
                </select>
              </td>
              <td>{clientItem.telefono_vendedor || "-"}</td>
              {/** Muestra el teléfono del vendedor asignado */}
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && (
        <p className={styles.noData}>No se encontraron clientes.</p>
      )}
    </div>
  );
};

export default ClientsTable;
