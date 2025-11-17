"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import styles from "./pedidos-list.module.css"

interface Pedido {
  id: number
  created_at: string
  estado: string | null
  observaciones: string | null
  cliente_id: string
  total: number | null
  numero_vendedor: number | null
}

interface PedidoItem {
  id: number
  pedido_id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  nombre_prod: string
  descripcion: string | null
  foto: string | null
  marca: string | null
  codigo: string | null
}

export default function PedidosList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
  const [itemsPedido, setItemsPedido] = useState<PedidoItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) setPedidos(data)
      setLoading(false)
    }

    fetchPedidos()
  }, [])

  const cargarItemsPedido = async (pedido: Pedido) => {
    setLoadingItems(true)
    const { data, error } = await supabase
      .from("pedido_items")
      .select("*")
      .eq("pedido_id", pedido.id)

    if (!error && data) setItemsPedido(data)
    setLoadingItems(false)
  }

  const abrirDetalles = async (pedido: Pedido) => {
    setPedidoSeleccionado(pedido)
    await cargarItemsPedido(pedido)
  }

  if (loading) return <div>Cargando pedidos...</div>
  if (pedidos.length === 0) return <div>No hay pedidos registrados.</div>

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
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id} className={styles.row}>
              <td>{p.id}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
              <td>{p.estado || "-"}</td>
              <td>{p.total ?? "-"}</td>
              <td>{p.numero_vendedor ?? "-"}</td>
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

            <p><strong>Fecha:</strong> {new Date(pedidoSeleccionado.created_at).toLocaleString()}</p>
            <p><strong>Estado:</strong> {pedidoSeleccionado.estado || "-"}</p>
            <p><strong>Observaciones:</strong> {pedidoSeleccionado.observaciones || "-"}</p>
            <p><strong>Cliente ID:</strong> {pedidoSeleccionado.cliente_id}</p>
            <p><strong>Total:</strong> {pedidoSeleccionado.total ?? "-"}</p>
            <p><strong>N° vendedor:</strong> {pedidoSeleccionado.numero_vendedor ?? "-"}</p>

            <h4>Productos del pedido</h4>

            {loadingItems && <div>Cargando productos...</div>}

            {!loadingItems && itemsPedido.length === 0 && (
              <div>No hay items asociados.</div>
            )}

            {!loadingItems && itemsPedido.length > 0 && (
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
                  {itemsPedido.map((item) => (
                    <tr key={item.id} className={styles.itemsRow}>
                      <td>{item.nombre_prod}</td>
                      <td>{item.cantidad}</td>
                      <td>{item.precio_unitario}</td>
                      <td>{item.cantidad * item.precio_unitario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              className={styles.btnCerrar}
              onClick={() => {
                setPedidoSeleccionado(null)
                setItemsPedido([])
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
