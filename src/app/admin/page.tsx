import { RecentItems } from "../components/admin/recent-items"
import styles from "./admin-page.module.css"

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
    
      <RecentItems />
    </div>
  )
}
