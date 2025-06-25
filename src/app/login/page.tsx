"use client"

import LoginForm from "./login-form"
import { useState } from "react"

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate login logic
          if (data.email === "admin@meleycía.com" && data.password === "123456") {
            resolve("success")
          } else {
            reject(new Error("Credenciales incorrectas"))
          }
        }, 2000)
      })

      // Redirect on success
     
      // window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
    </div>
  )
}
