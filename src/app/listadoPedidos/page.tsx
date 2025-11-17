"use client";

import Navbar from "../components/landing/Navbar";
import PedidosList from "./PedidosList";
import styles from "../components/landing/Navbar.module.css";

export default function RegisterPage() {
  return (
    <div>
      <Navbar />
      <PedidosList />
    </div>
  );
}
