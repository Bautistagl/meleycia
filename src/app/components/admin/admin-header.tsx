import Link from "next/link"
import styles from "./admin-header.module.css"
import { Bell, Settings, User } from "lucide-react"

export function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/admin" className={styles.logo}>
          <img src="/placeholder.svg?height=40&width=120" alt="Mele y Cia" className={styles.logoImage} />
          <span className={styles.adminText}>Admin</span>
        </Link>

        <div className={styles.actions}>
          <button className={styles.iconButton}>
            <Bell size={20} />
          </button>
          <button className={styles.iconButton}>
            <Settings size={20} />
          </button>
          <div className={styles.userMenu}>
            <span className={styles.userName}>Admin User</span>
            <div className={styles.userAvatar}>
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
