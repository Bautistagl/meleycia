"use client";

import type React from "react";
import { useState, type FormEvent } from "react";
import styles from "../login/login-form.module.css";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

interface ResetPasswordFormData {
  email: string;
}

const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = (): boolean => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email inválido");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (error) {
      console.error("Error al enviar email de recuperación:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: "Email enviado",
      text: "Revisá tu correo para cambiar la contraseña.",
      icon: "success",
    });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Recuperar contraseña</h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ email: e.target.value })
              }
              className={styles.input}
              autoComplete="email"
              disabled={loading}
            />
            {error && (
              <span className={styles.fieldError}>{error}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
