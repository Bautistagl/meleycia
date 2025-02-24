import React from 'react'
import styles from './Suppliers.module.css'
import Image from 'next/image'

// This is just sample data. Replace with your actual supplier data.
const supplierData = [
  { id: 1, name: 'Supplier 1', logo: '/logoArcor.png' },
  { id: 2, name: 'Supplier 2', logo: '/LogoEnergizer.png' },
  { id: 3, name: 'Supplier 3', logo: '/LogoMarlboro.png' },
  { id: 4, name: 'Supplier 4', logo: '/LogoRayo.png' },
  { id: 5, name: 'Supplier 5', logo: '/LogoEveready.png' },
  { id: 6, name: 'Supplier 6', logo: '/LogoLumilagro.png' },
  { id: 7, name: 'Supplier 7', logo: '/LogoMagiclick.png' },
  { id: 8, name: 'Supplier 8', logo: '/LogoGuaymallen.avif' },
  { id: 9, name: 'Supplier 9', logo: '/LogoJorgito.png' },
  { id: 10, name: 'Supplier 10', logo: '/LogoUnipox.png' },
  { id: 11, name: 'Supplier 11', logo: '/LogoSc.png' },
  { id: 12, name: 'Supplier 12', logo: '/LogoFelfort.png' },
]

const Suppliers: React.FC = () => {
  return (
    <section className={styles.suppliersSection}>
      {/* <h2 className={styles.title}>Nuestros proveedores</h2> */}
      <div className={styles.supplierGrid}>
        {supplierData.map((supplier) => (
              <div key={supplier.id} className="card">
              <div className="card-inner">
                <div className="card-front">
                <Image src={supplier.logo} alt={`logo`} height={100} width={140} className={styles.logo} />
                </div>
                <div className="card-back">
                <ul id="category-toggle-list">
	<li className="project-category web "><a href="#">Ver Productos</a></li>

</ul>
                </div>
              </div>
            </div>
          // <div key={supplier.id} className={styles.supplierCard}>
          //   <div className={styles.logoContainer}>
          //   <Image src={supplier.logo} alt={`logo`} height={120} width={160} className={styles.logo} />
          //   </div>
           
          // </div>
        ))}
      </div>

    </section>
  )
}

export default Suppliers

