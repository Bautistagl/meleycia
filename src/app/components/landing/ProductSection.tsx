import Image from 'next/image'
import './product-section.css'

interface Product {
  id: number
  name: string
  image: string
  type: string
}

const products: Product[] = [
  {
    id: 1,
    name: "Energizer MAX® Baterias",
    image: "/Prod1.webp?height=400&width=400",
    type: "C"
  },
  {
    id: 2,
    name: "Energizer MAX® Pilas AA",
    image: "/Prod2.webp?height=400&width=400",
    type: "AA"
  },
  {
    id: 3,
    name: "Energizer MAX® Pilas AAA",
    image: "/Prod3.webp?height=400&width=400",
    type: "AAA"
  },
  {
    id: 4,
    name: "Energizer Ultimate Lithium™ Pilas AAA",
    image: "/Prod4.webp?height=400&width=400",
    type: "AAA"
  },
  {
    id: 5,
    name: "Energizer Recharge® Pilas AAA",
    image: "/Prod2.webp?height=400&width=400",
    type: "AAA"
  }
]

export default function ProductSection() {
  return (
    <section className="product-section">
        <h2>OFERTAS DESTACADAS</h2>
      
      <div className="products-container">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div className="product-image">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="product-img"
              />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
             
            </div>
          </article>
        ))}
      </div>

    

      <div className="cta-container">
        <button className="cta-button">CONSULTAR PRECIOS</button>
      </div>
    </section>
  )
}

