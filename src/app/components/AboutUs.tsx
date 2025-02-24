import styles from "./about-us.module.css";

export default function AboutUs() {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Sobre Nosotros</h2>

        <div className={styles.content}>
          <div className={styles.textContent}>
            <p className={styles.description}>
              Con más de 20 años de experiencia, Mele y CIA se ha consolidado
              como líder en la distribución de productos de alta calidad en el
              mercado. Nuestra dedicación a la excelencia y compromiso con
              nuestros clientes nos distingue como el socio comercial preferido
              para las marcas más prestigiosas.
            </p>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>20+</span>
                <span className={styles.statLabel}>Años de Experiencia</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Clientes Satisfechos</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>12</span>
                <span className={styles.statLabel}>Marcas Principales</span>
              </div>
            </div>
          </div>

          <div className={styles.imageContainer}>
            <img
              src="/placeholder.svg?height=400&width=500"
              alt="Mele y CIA warehouse operations"
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
