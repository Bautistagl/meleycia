"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./admin-sidebar.module.css"
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? styles.active : ""
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <h3 className={styles.navTitle}>ADMIN</h3>
          <ul className={styles.navList}>
            <li>
              <Link
                href="/admin"
                className={`${styles.navLink} ${isActive("/admin") && pathname === "/admin" ? styles.active : ""}`}
              >
                <LayoutDashboard size={20} />
                <span>Principal</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/productos"
                className={`${styles.navLink} ${isActive("/admin/products") ? styles.active : ""}`}
              >
                <Package size={20} />
                <span>Productos</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/actualizacion"
                className={`${styles.navLink} ${isActive("/admin/orders") ? styles.active : ""}`}
              >
                <ShoppingCart size={20} />
                <span>Actualizar precios</span>
              </Link>
            </li>


          </ul>
        </div>

        <div className={styles.navGroup}>
          <h3 className={styles.navTitle}>Settings</h3>
          <ul className={styles.navList}>
      
            <li>
              <button className={styles.navLink}>
                <LogOut size={20} />
                <span>Cerrar Sesion</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}
