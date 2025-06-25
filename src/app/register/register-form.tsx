"use client";

import type React from "react";
import { useState, type FormEvent } from "react";
import styles from "../login/login-form.module.css";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  email: string;
  password: string;
  repeatPassword: string;
  nombre: string;
  telefono: string;
}



const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    repeatPassword: "",
    nombre: "",
    telefono: "",
  });
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Contraseña mínima 6 caracteres";
    }

    if (formData.password !== formData.repeatPassword) {
      errors.repeatPassword = "Las contraseñas no coinciden";
    }

    if (!formData.nombre.trim()) {
      errors.nombre = "Nombre requerido";
    }

    if (!formData.telefono.trim()) {
      errors.telefono = "Teléfono requerido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { email, password, nombre, telefono } = formData;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Error al registrar el usuario:", signUpError);
      Swal.fire({
        title: "Error de registro",
        text: signUpError.message,
        icon: "error",
      });
      return;
    }

    if (data && data.user) {
      const userId = data.user.id;

      const { error: insertError } = await supabase.from("clientes").insert({
        id: userId,
        email,
        nombre,
        telefono,
      });

      if (insertError) {
        console.error("Error al insertar en la tabla clientes:", insertError);
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al guardar la información del cliente.",
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "Cuenta registrada exitosamente",
        icon: "success",
      });
      router.push("/login");
    } else {
      console.error(
        "El registro fue exitoso, pero no se pudo obtener el ID del usuario."
      );
      Swal.fire({
        title: "Error",
        text: "La cuenta se registró, pero no pudimos vincular la información del cliente. Por favor, inténtelo de nuevo o contacte al soporte.",
        icon: "error",
      });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Registro</h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="nombre" className={styles.label}>
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              className={styles.input}
              autoComplete="name"
            />
            {formErrors.nombre && (
              <span className={styles.fieldError}>{formErrors.nombre}</span>
            )}
          </div>

          {/* Teléfono */}
          <div className={styles.inputGroup}>
            <label htmlFor="telefono" className={styles.label}>
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              className={styles.input}
              autoComplete="tel"
            />
            {formErrors.telefono && (
              <span className={styles.fieldError}>{formErrors.telefono}</span>
            )}
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={styles.input}
              autoComplete="email"
            />
            {formErrors.email && (
              <span className={styles.fieldError}>{formErrors.email}</span>
            )}
          </div>

          {/* Contraseña */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={styles.input}
              autoComplete="new-password"
            />
            {formErrors.password && (
              <span className={styles.fieldError}>{formErrors.password}</span>
            )}
          </div>

          {/* Repetir Contraseña */}
          <div className={styles.inputGroup}>
            <label htmlFor="repeatPassword" className={styles.label}>
              Repetir Contraseña
            </label>
            <input
              type="password"
              id="repeatPassword"
              value={formData.repeatPassword}
              onChange={(e) =>
                handleInputChange("repeatPassword", e.target.value)
              }
              className={styles.input}
              autoComplete="new-password"
            />
            {formErrors.repeatPassword && (
              <span className={styles.fieldError}>
                {formErrors.repeatPassword}
              </span>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Registrarme
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
