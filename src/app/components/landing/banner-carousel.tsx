"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import styles from "./banner-carousel.module.css"

interface BannerImage {
  id: string
  src: string
  alt: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}

interface BannerCarouselProps {
  images?: BannerImage[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showIndicators?: boolean
  showNavigation?: boolean
}

const defaultImages: BannerImage[] = [
  {
    id: "1",
    src: "/energizer_banner.jpg",
    alt: "Oferta especial en baterías",
    title: "50% OFssF en Baterías Energizer",
    subtitle: "Aprovecha esta oferta limitada",
    ctaText: "Ver Ofertas",
    ctaLink: "#",
  },
  {
    id: "2",
    src: "\LogoFelfort.png",
    alt: "Promoción productos de limpieza",
    title: "Productos de Limpieza",
    subtitle: "2x1 en productos seleccionados",
    ctaText: "Comprar Ahora",
    ctaLink: "#",
  },
  {
    id: "3",
    src: "/energizer_banner.jpg",
    alt: "Descuentos en herramientas",
    title: "Herramientas Profesionales",
    subtitle: "Hasta 30% de descuento",
    ctaText: "Ver Catálogo",
    ctaLink: "#",
  },
]

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  images = defaultImages,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showNavigation = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }, [images.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }, [images.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [isPlaying, nextSlide, autoPlayInterval])

  const handleMouseEnter = () => {
    if (autoPlay) setIsPlaying(false)
  }

  const handleMouseLeave = () => {
    if (autoPlay) setIsPlaying(true)
  }

  if (images.length === 0) return null
  
  return (
    <section className={styles.bannerCarousel}>
      <div className={styles.container}>
        <div className={styles.carouselWrapper} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className={styles.carouselTrack}>
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`${styles.slide} ${index === currentIndex ? styles.active : ""}`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                <div className={styles.imageContainer}>
                  <img src={image.src } alt={image.alt} className={styles.bannerImage} />
                  <div className={styles.overlay}>
                    <div className={styles.content}>
                      {image.title && <h2 className={styles.title}>{image.title}</h2>}
                      {image.subtitle && <p className={styles.subtitle}>{image.subtitle}</p>}
                      {image.ctaText && image.ctaLink && (
                        <a href={image.ctaLink} className={styles.ctaButton}>
                          {image.ctaText}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showNavigation && images.length > 1 && (
            <>
              <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={prevSlide}
                aria-label="Imagen anterior"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={nextSlide}
                aria-label="Siguiente imagen"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          {showIndicators && images.length > 1 && (
            <div className={styles.indicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentIndex ? styles.activeIndicator : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default BannerCarousel
