import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.column}>
          <h3 className={styles.title}>Empresa</h3>
          <Link href="/sobre-nosotros" className={styles.footerLink}>Sobre Nosotros</Link>
          <Link href="/historia" className={styles.footerLink}>Historia</Link>
          <Link href="/equipo" className={styles.footerLink}>Equipo</Link>
        </div>
        <div className={styles.column}>
          <h3 className={styles.title}>Productos</h3>
          <Link href="/productos" className={styles.footerLink}>Catálogo</Link>
          <Link href="/marcas" className={styles.footerLink}>Marcas</Link>
          <Link href="/novedades" className={styles.footerLink}>Novedades</Link>
        </div>
        <div className={styles.column}>
          <h3 className={styles.title}>Servicios</h3>
          <Link href="/distribucion" className={styles.footerLink}>Distribución</Link>
          <Link href="/mayoristas" className={styles.footerLink}>Mayoristas</Link>
          <Link href="/logistica" className={styles.footerLink}>Logística</Link>
        </div>
        <div className={styles.column}>
          <h3 className={styles.title}>Legal</h3>
          <Link href="/privacidad" className={styles.footerLink}>Privacidad</Link>
          <Link href="/terminos" className={styles.footerLink}>Términos</Link>
          <Link href="/cookies" className={styles.footerLink}>Cookies</Link>
        </div>
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} Mele y Cia. Todos los derechos reservados.
      </div>
    </footer>
  )
}

