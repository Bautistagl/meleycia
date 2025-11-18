"use client";

import Navbar from "../components/landing/Navbar";

import styles from "../components/landing/Navbar.module.css";
import PedidosCliente from "./ListadoCliente";

export default function RegisterPage() {
  return (
    <div>
      <Navbar />
      <PedidosCliente />
    </div>
  );
}
