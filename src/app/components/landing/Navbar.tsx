export const dynamic = "force-dynamic";
("use client");

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const mailCliente = localStorage.getItem("meleyciamail") ?? "";

    if (mailCliente === "meleycia@admin.com") {
      setAdmin(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(!!session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      localStorage.clear();
      router.push("/login");
    }
  };

  const mail = localStorage.getItem("meleyciamail") ?? "";
  const esVendedor = mail.includes("@ventasmele.com");

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src="/logo2.JPG" alt="" height={230} width={440} />
        </Link>
      </div>

      <div className={`${styles.navLinks} ${isOpen ? styles.open : ""}`}>
        {admin && (
          <Link href="/admin/productos" className={styles.navLink}>
            Backoffice
          </Link>
        )}

        <Link href="/productos" className={styles.navLink}>
          Productos
        </Link>

        {(admin || esVendedor) && (
          <Link href="/listadoPedidos" className={styles.navLink}>
            Pedidos
          </Link>
        )}
        {!admin && !esVendedor && (
          <Link href="/pedidoCliente" className={styles.navLink}>
            Pedidos
          </Link>
        )}

        {!esVendedor && (
          <>
            <Link href="/pedido" className={styles.navLink}>
              Carrito
            </Link>

            <Link href="/pedido">
              <Image
                src="/cartIcon.png"
                alt="Shopping Cart"
                width={30}
                height={30}
                className={styles.cartIcon2}
              />
            </Link>
          </>
        )}
      </div>

      {user ? (
        <div style={{ display: "flex" }}>
          <button className={styles.ctabutton3} onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <Link href="/login">
          <button className="cta-button3">Iniciar Sesión</button>
        </Link>
      )}

      <div
        className={`${styles.mobileMenuToggle} ${isOpen ? styles.open : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;
