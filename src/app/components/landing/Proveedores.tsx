import React from 'react'
import styles from './Suppliers.module.css'
import Image from 'next/image'

// This is just sample data. Replace with your actual supplier data.
const supplierData = [
  { id: 2, name: "Energizer", logo: "/LogoEnergizer.png" },
  { id: 13, name: "Mondeles", logo: "/LogoMonde.jpg" },
  { id: 3, name: "Supplier 3", logo: "/massalinLogo.jpg" },
  { id: 7, name: "Magiclick", logo: "/LogoMagiclick.png" },
  { id: 4, name: "Rayovac", logo: "/LogoRayo.png" },
  { id: 5, name: "Eveready", logo: "/LogoEver.webp" },
  { id: 6, name: "Lumilagro", logo: "/LogoLumilagro.png" },
  { id: 8, name: "Guaymallen", logo: "/LogoGuaymallen.avif" },
  { id: 9, name: "Jorgito", logo: "/LogoJorgito.png" },
  { id: 10, name: "Poxiba", logo: "/LogoPoxipol2.webp" },
  { id: 11, name: "JOHNSON & JOHNSON", logo: "/LogoSc.png" },
  { id: 12, name: "Felfort", logo: "/LogoFelfort.png" },
  { id: 14, name: "Ferrero", logo: "/LogoFerrero.png" },
  { id: 15, name: "Lion Rolling Circus", logo: "/LogoLion.png" },
  { id: 16, name: "Prime", logo: "/LogoPrime.jpg" },
  { id: 17, name: "Don Satur", logo: "/LogoDon.png" },
  { id: 18, name: "ARCOR", logo: "/LogoArcor.png" },
];

const Suppliers: React.FC = () => {
  return (
    <section className={styles.suppliersSection}>
      <div className={styles.supplierGrid}>
        {supplierData.map((supplier) => (
          <div key={supplier.id} className="card">
            <div className="card-inner">
              <div className="card-front">
                <Image
                  src={supplier.logo}
                  alt={`logo`}
                  height={100}
                  width={140}
                  className={styles.logo}
                />
              </div>
              <div className="card-back">
                <ul id="category-toggle-list">
                  <li className="project-category web ">
                    <a href={`/productos?brand=${supplier.name}`}>
                      Ver Productos
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Suppliers

