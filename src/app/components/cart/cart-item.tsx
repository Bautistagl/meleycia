"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import type { CarritoItem } from "@/types"
import styles from "./cart-item.module.css"

interface CartItemProps {
  item: CarritoItem
  updateQuantity: (id: number, quantity: number) => void
  removeItem: (id: number) => void
}

export default function CartItem({ item, updateQuantity, removeItem }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.cantidad)

  // Update local state when item changes from parent
  useEffect(() => {
    setQuantity(item.cantidad)
  }, [item.cantidad])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number.parseInt(e.target.value)
    if (isNaN(newQuantity) || newQuantity < 1) return

    setQuantity(newQuantity)
    updateQuantity(item.id, newQuantity)
  }

  const incrementQuantity = () => {
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    updateQuantity(item.id, newQuantity)
  }

  const decrementQuantity = () => {
    if (quantity <= 1) return
    const newQuantity = quantity - 1
    setQuantity(newQuantity)
    updateQuantity(item.id, newQuantity)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  const totalPrice = item.producto?.precio * quantity
 
  return (
    <div className={styles.cartItem}>
      <div className={styles.product}>
        <div className={styles.productImage}>
          <Image
            src={ item.foto || "/placeholder.svg?height=80&width=80"}
            alt={item.producto.nombre || "Producto"}
            width={80}
            height={80}
            className={styles.image}
          />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{item.producto?.nombre || `Producto #${item.producto_id}`}</h3>
          <p className={styles.productCategory}>{item.marca || "Sin Marca"}</p>
        </div>
      </div>

      <div className={styles.price}>
        <span className={styles.mobileLabel}>Precio:</span>${item.producto?.precio}
      </div>

      <div className={styles.quantity}>
        <span className={styles.mobileLabel}>Cantidad:</span>
        <div className={styles.quantityControls}>
          <button className={styles.quantityBtn} onClick={decrementQuantity} disabled={quantity <= 1}>
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className={styles.quantityInput}
          />
          <button className={styles.quantityBtn} onClick={incrementQuantity}>
            +
          </button>
        </div>
      </div>

      <div className={styles.total}>
        <span className={styles.mobileLabel}>Total:</span>${totalPrice.toFixed(2)}
      </div>

      <div className={styles.action}>
        <button className={styles.removeBtn} onClick={handleRemove} aria-label="Eliminar producto">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
