"use client";

import type React from "react";
import { useState, useEffect, type FormEvent } from "react";
import styles from "../login/login-form.module.css";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface ResetPasswordFormData {
  password: string;
  repeatPassword: string;
}

const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    repeatPassword: "",
  });

  const [formErrors, setFormErrors] =
    useState<Partial<ResetPasswordFormData>>({});

  const router = useRouter();

  useEffect(() => {
    // Verificación defensiva: si no hay sesión, no vino desde el email
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        Swal.fire({
          title: "Link inválido o expirado",
          text: "Solicitá nuevamente el cambio de contraseña.",
          icon: "error",
        }).then(() => router.push("/login"));
      }
    });
  }, [router]);

  const validateForm = (): boolean => {
    const errors: Partial<ResetPasswordFormData> = {};

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Contraseña mínima 6 caracteres";
    }

    if (formData.password !== formData.repeatPassword) {
      errors.repeatPassword = "Las contraseñas no coinciden";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof ResetPasswordFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { password } = formData;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Error al actualizar contraseña:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: "Contraseña actualizada",
      text: "Ya podés iniciar sesión con tu nueva contraseña.",
      icon: "success",
    }).then(() => router.push("/login"));
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Nueva contraseña</h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Nueva contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                handleInputChange("password", e.target.value)
              }
              className={styles.input}
              autoComplete="new-password"
            />
            {formErrors.password && (
              <span className={styles.fieldError}>
                {formErrors.password}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="repeatPassword" className={styles.label}>
              Repetir contraseña
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
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
