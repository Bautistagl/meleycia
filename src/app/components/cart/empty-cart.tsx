import Link from "next/link"
import styles from "./cart.module.css"

export default function EmptyCart() {
  return (
    <div className={styles.emptyCart}>
     
      <p className={styles.emptyCartTitle}>Parece que aún no has añadido productos a tu pedido.</p>
      <Link href="/productos">
        <button className={styles.ctabutton4}>Continuar comprando</button>
      </Link>
    </div>
  )
}
