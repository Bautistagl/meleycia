"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./pedidos-list.module.css";

interface Cliente {
  nombre: string | null;
  telefono: string | null;
  direccion: string | null;
}

interface Pedido {
  id: number;
  created_at: string;
  estado: string | null;
  observaciones: string | null;
  cliente_id: string;
  total: number | null;
  numero_vendedor: number | null;
  vendedor: string | null;
  cliente: Cliente | null;
}

interface PedidoItem {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  precio_oferta: number;
  nombre_prod: string;
  descripcion: string | null;
  foto: string | null;
  marca: string | null;
  codigo: string | null;
}

export default function PedidosList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );
  const [itemsPedido, setItemsPedido] = useState<PedidoItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [vendedorLocal, setVendedorLocal] = useState("");

  useEffect(() => {
    const mail = localStorage.getItem("meleyciamail");

    if (mail) {
      const nombre = mail.split("@")[0].trim();
      setVendedorLocal(nombre);
    }
  }, []);

  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select(
          `
            *,
            cliente:cliente_id (
              nombre,
              telefono,
              direccion
            )
          `
        )
        .order("created_at", { ascending: false });

      if (!error && data) setPedidos(data);
      setLoading(false);
    };

    fetchPedidos();
  }, []);

  const cargarItemsPedido = async (pedido: Pedido) => {
    setLoadingItems(true);

    const { data, error } = await supabase
      .from("pedido_items")
      .select("*")
      .eq("pedido_id", pedido.id);

    if (!error && data) setItemsPedido(data);
    setLoadingItems(false);
  };

  const abrirDetalles = async (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    await cargarItemsPedido(pedido);
  };

  if (loading) return <div>Cargando pedidos...</div>;

  const pedidosFiltrados = pedidos.filter((p) => {
    if (!vendedorLocal) return false;

    const mail = localStorage.getItem("meleyciamail") ?? "";

    if (mail === "meleycia@admin.com") {
      return p.numero_vendedor === 1;
    }

    const vendedorPedido = (p.vendedor ?? "").toLowerCase();
    const vendedorLocalLower = vendedorLocal.toLowerCase();

    return vendedorPedido === vendedorLocalLower;
  });

  if (pedidosFiltrados.length === 0)
    return <div>No hay pedidos para este vendedor.</div>;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Pedidos</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Vendedor</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidosFiltrados.map((p) => (
            <tr key={p.id} className={styles.row}>
              <td>{p.id}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
              <td>{p.estado || "-"}</td>
              <td>{p.total?.toFixed(2) ?? "-"}</td>
              <td>{p.vendedor ?? "-"}</td>
              <td>{p.cliente?.nombre ?? "-"}</td>
              <td>{p.cliente?.telefono ?? "-"}</td>
              <td>
                <button
                  className={styles.btnDetalles}
                  onClick={() => abrirDetalles(p)}
                >
                  Ver detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pedidoSeleccionado && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Pedido #{pedidoSeleccionado.id}</h3>

            <p className={styles.info}>
              <strong>Fecha:</strong>{" "}
              {new Date(pedidoSeleccionado.created_at).toLocaleString()}
            </p>
            <p className={styles.info}>
              <strong>Estado:</strong> {pedidoSeleccionado.estado || "-"}
            </p>

            <p className={styles.info}>
              <strong>Total:</strong> {pedidoSeleccionado.total ?? "-"}
            </p>

            <p className={styles.info}>
              <strong>Cliente:</strong>{" "}
              {pedidoSeleccionado.cliente?.nombre ?? "-"}
            </p>
            <p className={styles.info}>
              <strong>Teléfono:</strong>{" "}
              {pedidoSeleccionado.cliente?.telefono ?? "-"}
            </p>
            <p className={styles.info}>
              <strong>Direccion:</strong>{" "}
              {pedidoSeleccionado.cliente?.direccion ?? "-"}
            </p>

            {loadingItems && <div>Cargando productos...</div>}
            {!loadingItems && itemsPedido.length === 0 && (
              <div>No hay items asociados.</div>
            )}
            {!loadingItems && itemsPedido.length > 0 && (
              <div className={styles.itemsContainer}>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {itemsPedido.map((item) => {
                      const precio =
                        item.precio_oferta && item.precio_oferta > 0
                          ? item.precio_oferta
                          : item.precio_unitario;

                      return (
                        <tr key={item.id} className={styles.itemsRow}>
                          <td className={styles.info}>{item.nombre_prod}</td>
                          <td className={styles.info}>{item.cantidad}</td>
                          <td className={styles.info}>{precio}</td>
                          <td className={styles.info}>
                            {item.cantidad * precio}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <button
              className={styles.btnCerrar}
              onClick={() => {
                setPedidoSeleccionado(null);
                setItemsPedido([]);
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
