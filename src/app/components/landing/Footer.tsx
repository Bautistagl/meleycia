import type React from "react";
import styles from "./Footer.module.css";

interface FooterProps {
  companyName?: string;
  year?: number;
}

const Footer: React.FC<FooterProps> = ({
  companyName = "MELE Y CIA",
  year = new Date().getFullYear(),
}) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Company Info Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>EMPRESA</h3>

            <p className={styles.companyDescription}>
              Líderes en la distribución de productos de alta calidad.
              Trabajamos con las mejores marcas para ofrecer soluciones
              excepcionales.
            </p>

            {/* Branches Grid */}
            <div className={styles.branchesGrid}>
              <div className={styles.branch}>
                <h4 className={styles.branchName}>Casa Central</h4>
                <p className={styles.branchAddress}>
                  Avda. Pte Perón 7290 – Ituzaingó
                </p>
                <p className={styles.branchContact}>Tel: 4623-9000 / 9889</p>
                <p className={styles.branchContact}>WhatsApp: 11 3347-8376</p>
              </div>

              <div className={styles.branch}>
                <h4 className={styles.branchName}>Sucursal Morón</h4>
                <p className={styles.branchAddress}>Mendoza 34 – Morón</p>
                <p className={styles.branchContact}>Tel: 4483-5500</p>
                <p className={styles.branchContact}>WhatsApp: 11 6130-1995</p>
              </div>

              <div className={styles.branch}>
                <h4 className={styles.branchName}>Sucursal Merlo</h4>
                <p className={styles.branchAddress}>Suipacha 456 – Merlo</p>
                <p className={styles.branchContact}>Tel: 0220-486-3094</p>
                <p className={styles.branchContact}>WhatsApp: 11 6130-1918</p>
              </div>

              <div className={styles.branch}>
                <h4 className={styles.branchName}>Sucursal Moreno</h4>
                <p className={styles.branchAddress}>
                  Bartolomé Mitre 165 – Moreno
                </p>
                <p className={styles.branchContact}>Tel: 0237-463-8012</p>
                <p className={styles.branchContact}>WhatsApp: 11 6130-1740</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>SÍGUENOS</h3>
            <div className={styles.socialLinks}>
              <a
                href="https://www.instagram.com/meleycia/?igsh=dmc3aHJ6OHdyaWtq#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Síguenos en Instagram"
              >
                <svg
                  className={styles.socialIcon}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.facebook.com/Meleycia"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Síguenos en Facebook"
              >
                <svg
                  className={styles.socialIcon}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>
            &copy; {year} {companyName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
