import React from 'react';
import { TruckIcon, PercentIcon, PackageIcon } from 'lucide-react';
import './Features.css';

const featuresOptions = [
  {
    icon: <TruckIcon className="icon-red" />,
    title: 'Logística Eficiente',
    description: 'Coordinamos entregas rápidas y seguras en todo el país con nuestra red de transporte optimizada.'
  },
  {
    icon: <PercentIcon className="icon-red" />,
    title: 'Descuentos por Volumen',
    description: 'Obtén beneficios exclusivos y precios especiales al realizar compras en grandes cantidades.'
  },
  {
    icon: <PackageIcon className="icon-red" />,
    title: 'Amplia Variedad',
    description: 'Contamos con un catálogo extenso y actualizado que abarca múltiples categorías.'
  }
];

export default function Features() {
  return (
    <section className="features-section2">
      <div className="container">
        <div className="features-grid2">
          {featuresOptions.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
