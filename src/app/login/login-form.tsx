"use client"

import type React from "react"
import { useEffect, useState, type FormEvent } from "react"
import styles from "./login-form.module.css"
import { supabase } from "@/lib/supabase"
import Swal from "sweetalert2"
import { useRouter } from "next/navigation"

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void> | void
  isLoading?: boolean
  error?: string
}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {}

    if (!formData.email) {
      errors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Ingresa un email válido"
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    const { email, password } = formData
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
    } else {

      localStorage.setItem('meleyciamail', email) 
      setIsLoading(false)
      router.push('/')
    }

  }


  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <h1 className={styles.logoText}>MELE Y CIA</h1>
          </div>
          <h2 className={styles.title}>Iniciar Sesión</h2>
          <p className={styles.subtitle}>Accede a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`${styles.input} ${formErrors.email ? styles.inputError : ""}`}
                placeholder="tu@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {formErrors.email && <span className={styles.fieldError}>{formErrors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`${styles.input} ${formErrors.password ? styles.inputError : ""}`}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {/* Icons omitidos por brevedad */}
              </button>
            </div>
            {formErrors.password && <span className={styles.fieldError}>{formErrors.password}</span>}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿No tienes una cuenta?{" "}
            <a href="/register" className={styles.signupLink}>Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
