import React from 'react'
import styles from './Suppliers.module.css'
import Image from 'next/image'

// This is just sample data. Replace with your actual supplier data.
const supplierData = [
  { id: 1, name: "Supplier 1", logo: "/LogoArcor.png" },
  { id: 2, name: "Supplier 2", logo: "/LogoEnergizer.png" },
  { id: 3, name: "Supplier 3", logo: "/massalinLogo.jpg" },
  { id: 4, name: "Supplier 4", logo: "/LogoRayo.png" },
  { id: 5, name: "Supplier 5", logo: "/LogoEver.webp" },
  { id: 6, name: "Supplier 6", logo: "/LogoLumilagro.png" },
  { id: 7, name: "Supplier 7", logo: "/LogoMagiclick.png" },
  { id: 8, name: "Supplier 8", logo: "/LogoGuaymallen.avif" },
  { id: 9, name: "Supplier 9", logo: "/LogoJorgito.png" },
  { id: 10, name: "Supplier 10", logo: "/LogoPoxipol2.webp" },
  { id: 11, name: "Supplier 11", logo: "/LogoSc.png" },
  { id: 12, name: "Supplier 12", logo: "/LogoFelfort.png" },
  { id: 13, name: "Supplier 13", logo: "/LogoMonde.jpg" },
  { id: 14, name: "Supplier 14", logo: "/LogoFerrero.png" },
  { id: 15, name: "Supplier 15", logo: "/LogoLion.png" },
  { id: 16, name: "Supplier 16", logo: "/LogoPrime.jpg" },
  { id: 17, name: "Supplier 17", logo: "/LogoDon.png" },
];

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

