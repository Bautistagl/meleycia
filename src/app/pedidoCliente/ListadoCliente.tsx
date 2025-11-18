"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../listadoPedidos/pedidos-list.module.css";

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

export default function PedidosCliente() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );
  const [itemsPedido, setItemsPedido] = useState<PedidoItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [clienteId, setClienteId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mailLocal, setMailLocal] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mail = window.localStorage.getItem("meleyciamail") ?? "";
    setMailLocal(mail);

    const cargarCliente = async () => {
      if (!mail) return;

      const { data, error } = await supabase
        .from("clientes")
        .select("id")
        .eq("email", mail)
        .single();

      if (!error && data) {
        setClienteId(data.id);
      }
    };

    cargarCliente();
  }, [mounted]);

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

    const { data } = await supabase
      .from("pedido_items")
      .select("*")
      .eq("pedido_id", pedido.id);

    if (data) setItemsPedido(data);
    setLoadingItems(false);
  };

  const abrirDetalles = async (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    await cargarItemsPedido(pedido);
  };

  if (!mounted) return null;

  if (loading) return <div>Cargando pedidos...</div>;

  const pedidosFiltrados = (() => {
    if (!mailLocal) return [];

    if (mailLocal === "meleycia@admin.com") {
      return pedidos.filter((p) => p.numero_vendedor === 1);
    }

    return pedidos.filter((p) => p.cliente_id === clienteId);
  })();

  if (pedidosFiltrados.length === 0)
    return <div>No hay pedidos registrados para este cliente.</div>;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Mis pedidos</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Vendedor</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidosFiltrados.map((p) => (
            <tr key={p.id} className={styles.row}>
              <td>{p.id}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
              <td>{p.estado || "-"}</td>
              <td>
                <strong>${p.total?.toFixed(2) ?? "-"}</strong>
              </td>
              <td>{p.vendedor ?? "-"}</td>
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
              <strong>Vendedor:</strong> {pedidoSeleccionado.vendedor ?? "-"}
            </p>

            <h4>Productos del pedido</h4>

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
