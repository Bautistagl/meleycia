import type React from "react"

import styles from "./admin-layout.module.css"
import { AdminHeader } from "../components/admin/admin-header"
import { AdminSidebar } from "../components/admin/admin-sidebar"
import Navbar from "../components/landing/Navbar"

export const metadata = {
  title: "Admin Dashboard - Mele y Cia",
  description: "Admin dashboard for product management",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.adminLayout}>
      <Navbar />
      <div className={styles.contentWrapper}>
        <AdminSidebar />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  )
}
