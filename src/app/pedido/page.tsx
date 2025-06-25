import CartContainer from "../components/cart/cart-container";
import Navbar from "../components/landing/Navbar";
import styles from "./cart.module.css";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>PEDIDO</h1>
          <CartContainer />
        </div>
      </main>
    </>
  );
}
