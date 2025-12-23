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

  const [vendedorLocal, setVendedorLocal] = useState<string | null>(null);
  const [vendedores, setVendedores] = useState<
    { nombre: string; numero: number }[]
  >([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const mail = window.localStorage.getItem("meleyciamail") ?? "";
    setVendedorLocal(mail.split("@")[0].trim().toLowerCase());
    setIsAdmin(mail === "meleycia@admin.com");
  }, [mounted]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("vendedores")
      .select("nombre, numero")
      .order("nombre")
      .then(({ data }) => data && setVendedores(data));
  }, [isAdmin]);

  useEffect(() => {
    supabase
      .from("pedidos")
      .select(`*, cliente:cliente_id (nombre, telefono, direccion)`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPedidos(data);
        setLoading(false);
      });
  }, []);

  if (!mounted) return null;
  if (loading) return <div>Cargando pedidos...</div>;

  const pedidosFiltrados = (() => {
    const mail = window.localStorage.getItem("meleyciamail") ?? "";
    if (mail === "meleycia@admin.com")
      return pedidos.filter((p) => p.numero_vendedor === 1);
    return pedidos.filter(
      (p) => (p.vendedor ?? "").toLowerCase() === vendedorLocal
    );
  })();

  const actualizarEstado = async (id: number, estado: string) => {
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    const { data } = await supabase
      .from("pedidos")
      .select(`*, cliente:cliente_id (nombre, telefono, direccion)`)
      .order("created_at", { ascending: false });
    if (data) setPedidos(data);
  };
  const asignarVendedor = async (
    pedidoId: number,
    numero: number,
    nombre: string
  ) => {
    await supabase
      .from("pedidos")
      .update({ numero_vendedor: numero, vendedor: nombre.toLowerCase() })
      .eq("id", pedidoId);
  };
  const abrirDetalles = async (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setLoadingItems(true);
    const { data } = await supabase
      .from("pedido_items")
      .select("*")
      .eq("pedido_id", pedido.id);
    if (data) setItemsPedido(data);
    setLoadingItems(false);
  };

  if (pedidosFiltrados.length === 0) return <div>No hay pedidos.</div>;

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
              <td data-label="ID">
                <div>{p.id}</div>
              </td>
              <td data-label="Fecha">
                <div>{new Date(p.created_at).toLocaleString()}</div>
              </td>
              <td data-label="Estado">
                <select
                  value={p.estado ?? "Pendiente"}
                  onChange={(e) => actualizarEstado(p.id, e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Completo">Completo</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </td>
              <td data-label="Total">
                <div>{p.total?.toFixed(2) ?? "-"}</div>
              </td>
              <td>
                {" "}
                {isAdmin ? (
                  <select
                    value={p.numero_vendedor ?? ""}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      const vend = vendedores.find((v) => v.numero === num);
                      if (vend) asignarVendedor(p.id, vend.numero, vend.nombre);
                    }}
                  >
                    {" "}
                    <option value="">Sin asignar</option>{" "}
                    {vendedores.map((v) => (
                      <option key={v.numero} value={v.numero}>
                        {" "}
                        {v.nombre} ({v.numero}){" "}
                      </option>
                    ))}{" "}
                  </select>
                ) : (
                  p.vendedor ?? "-"
                )}{" "}
              </td>
              <td data-label="Cliente">
                <div>{p.cliente?.nombre ?? "-"}</div>
              </td>
              <td data-label="Teléfono">
                <div>{p.cliente?.telefono ?? "-"}</div>
              </td>
              <td data-label="Acciones">
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
              <strong>Estado:</strong> {pedidoSeleccionado.estado}
            </p>
            <p className={styles.info}>
              <strong>Total:</strong> {pedidoSeleccionado.total}
            </p>
            <p className={styles.info}>
              <strong>Cliente:</strong> {pedidoSeleccionado.cliente?.nombre}
            </p>
            <p className={styles.info}>
              <strong>Teléfono:</strong> {pedidoSeleccionado.cliente?.telefono}
            </p>
            <p className={styles.info}>
              <strong>Dirección:</strong>{" "}
              {pedidoSeleccionado.cliente?.direccion}
            </p>

            {loadingItems && <div>Cargando productos...</div>}

            {!loadingItems && (
              <div className={styles.itemsContainer}>
                <table className={styles.itemsTable}>
                  <thead className={styles.desktHeader}>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Código</th>
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
                        <tr key={item.id}>
                          <td data-label="Producto">
                            <div>{item.nombre_prod}</div>
                          </td>
                          <td data-label="Cant.">
                            <div>{item.cantidad}</div>
                          </td>
                          <td data-label="Código">
                            <div>{item.codigo}</div>
                          </td>
                          <td data-label="Precio">
                            <div>{precio}</div>
                          </td>
                          <td data-label="Total">
                            <div>{item.cantidad * precio}</div>
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
