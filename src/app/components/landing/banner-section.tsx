import type React from "react"
import styles from "./banner-section.module.css"

interface Brand {
  id: string
  name: string
  logo: string
}

interface BannerSectionProps {
  brands?: Brand[]
}

const defaultBrands: Brand[] = [
  { id: "1", name: "Arcor", logo: "/placeholder.svg?height=60&width=120" },
  { id: "2", name: "Energizer", logo: "/placeholder.svg?height=60&width=120" },
  { id: "3", name: "Marlboro", logo: "/placeholder.svg?height=60&width=120" },
  { id: "4", name: "Rayovac", logo: "/placeholder.svg?height=60&width=120" },
  { id: "5", name: "Johnson", logo: "/placeholder.svg?height=60&width=120" },
  { id: "6", name: "Wilkinson", logo: "/placeholder.svg?height=60&width=120" },
  { id: "7", name: "Magicclick", logo: "/placeholder.svg?height=60&width=120" },
  { id: "8", name: "Gunvallen", logo: "/placeholder.svg?height=60&width=120" },
  { id: "9", name: "Isojito", logo: "/placeholder.svg?height=60&width=120" },
  { id: "10", name: "Unipox", logo: "/placeholder.svg?height=60&width=120" },
  { id: "11", name: "SC Johnson", logo: "/placeholder.svg?height=60&width=120" },
  { id: "12", name: "Ver Productos", logo: "/placeholder.svg?height=60&width=120" },
]

const BannerSection: React.FC<BannerSectionProps> = ({ brands = defaultBrands }) => {
  return (
    <section className={styles.bannerSection}>
      <div className={styles.container}>
        <div className={styles.brandsGrid}>
          {brands.map((brand) => (
            <div key={brand.id} className={styles.brandItem}>
              <div className={styles.brandCircle}>
                <img src={brand.logo || "/placeholder.svg"} alt={`${brand.name} logo`} className={styles.brandLogo} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BannerSection
