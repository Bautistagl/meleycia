'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'
import Image from 'next/image'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        {/* Replace with your actual logo */}
        <Link href="/">
          <Image src='/logoMele.png' alt='' height={100} width={240}/>
        </Link>
      </div>
      <div className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
        <Link href="/" className={styles.navLink}>Proveedores</Link>
        <Link href="/about" className={styles.navLink}>Sobre Nosotros</Link>
        <Link href="/services" className={styles.navLink}>Productos</Link>
        <Link href="/contact" className={styles.navLink}>Contacto</Link>
      </div>
      <div className={styles.mobileMenuToggle} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  )
}

export default Navbar