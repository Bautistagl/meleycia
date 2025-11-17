"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../login/login-form.module.css";

interface FormData {
  email: string;
  password: string;
  repeatPassword: string;
}

const VendedorForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const errors: Partial<FormData> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Contraseña mínima 6 caracteres";
    }

    if (formData.password !== formData.repeatPassword) {
      errors.repeatPassword = "Las contraseñas no coinciden";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Registro</h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={styles.input}
            />
            {formErrors.email && (
              <span className={styles.fieldError}>{formErrors.email}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={styles.input}
            />
            {formErrors.password && (
              <span className={styles.fieldError}>{formErrors.password}</span>
            )}
          </div>

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

export default VendedorForm;
