"use client";
import React, { useRef, useState } from "react";
import { Battery, Zap, Package } from "lucide-react";
import "./features-section.css";
import Image from "next/image";

export default function FeaturesSection() {
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<number | null>(null); // Tipo explícito

  const handleMouseEnter = () => {
    timerRef.current = window.setTimeout(() => {
      setIsHovered(true);
    },200); // Retraso de medio segundo
  };

  const handleMouseLeave = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current); // Limpia el temporizador
      timerRef.current = null; // Resetea el ref
    }
    setIsHovered(false);
  };
  return (
    <section  className="features-section">
      <div>
        <div className="background-pattern"></div>
        <div className="gradient-overlay"></div>
      </div>
      <div className="text-container">
        <p>
          Somos líderes en la distribución de productos de alta calidad.
          
        </p>
        <span>Trabajamos con las mejores marcas para ofrecer soluciones
        excepcionales.</span>
        <div className="cta-container2">
        <button className="cta-button">CONSULTAR PRECIOS</button>
      </div>
      </div>
      <div className="imagen-hero">
        <Image alt="" src='/energizer-personaje2.png' height={270} width={600}/>
      </div>
    </section>
  );
}

{
  /* <div className="features-grid">
  <div className="feature">
    <Battery className="feature-icon" />
    <h3 className="feature-title">MÁS DURACIÓN </h3>
    <p className="feature-description">Trabaja y juega durante más tiempo.</p>
  </div>

  <div className="feature">
    <Zap className="feature-icon" />
    <h3 className="feature-title">MÁS PODER EN OTROS</h3>
    <p className="feature-description">
      Obtén más velocidad de tus dispositivos para jugar mejor. 
      Rotación más rápida para ahorrar tiempo al montar o desmontar muebles.
    </p>
  </div>

  <div className="feature">
    <Package className="feature-icon" />
    <h3 className="feature-title">EMBALAJE ÓPTIMO</h3>
    <p className="feature-description">
      El diseño único mantiene las pilas en su sitio y permite un 
      almacenamiento seguro cuando se reciclan.
    </p>
  </div>
</div> */
}
