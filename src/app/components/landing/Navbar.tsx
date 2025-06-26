"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(false);
  const [admin, setAdmin] = useState(false)

  useEffect(() => {

    const mailCliente = localStorage.getItem('meleyciamail') 
    if (mailCliente == 'meleycia@admin.com') {
      setAdmin(true)
    }
  
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(true);
        } else {
          setUser(false);
        }
      }
    );

    // Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(true);
      } else {
        setUser(false);
      }
      
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      localStorage.clear()
      router.push("/login"); // Redirect to login page after logout
    }
  };
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src="/logoMele.png" alt="" height={100} width={240} />
        </Link>
      </div>
      <div className={`${styles.navLinks} ${isOpen ? styles.open : ""}`}>
        {admin ? (
          <Link href="/admin" className={styles.navLink}>
            Backoffice
          </Link>
        ) : (
          ""
        )}

        <Link
          target="_blank"
          href="https://wa.me/+5491138824301"
          className={styles.navLink}
        >
          Contacto
        </Link>
        <Link href="/productos" className={styles.navLink}>
          Productos
        </Link>
        <Link href="/pedido" className={styles.navLink}>
          Pedido
        </Link>
      </div>{" "}
      {user ? (
        <div style={{ display: "flex" }}>
          {" "}
          <Link href="/pedido">
            <Image
              src="/carrito.png"
              alt="Shopping Cart"
              width={30}
              height={30}
              className={styles.cartIcon}
            />{" "}
          </Link>{" "}
          <button className={styles.ctabutton3} onClick={handleLogout}>
            Cerrar Sesión
          </button>{" "}
        </div>
      ) : (
        <Link href="/login">
          <button className="cta-button3">Iniciar Sesión</button>{" "}
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
