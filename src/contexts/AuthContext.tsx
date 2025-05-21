"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "../api/api"
import jwtDecode from "jwt-decode"

interface User {
  id: number
  username: string
  email: string
  role: "admin" | "client"
}

interface DecodedToken {
  id: number
  username: string
  role: "admin" | "client"
  exp: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Verificar si el token ha expirado
        const decoded = jwtDecode<DecodedToken>(token)
        const currentTime = Date.now() / 1000

        if (decoded.exp < currentTime) {
          localStorage.removeItem("token")
          setLoading(false)
          return
        }

        // Verificar token con el backend
        const data = await authService.verifyToken()
        setUser({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email || "",
          role: data.user.role,
        })
      } catch (err) {
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  // Función para iniciar sesión
  const login = async (username: string, password: string) => {
    setError(null)
    try {
      const data = await authService.login(username, password)
      localStorage.setItem("token", data.token)
      setUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
      })
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión")
      throw err
    }
  }

  // Función para registrarse
  const register = async (username: string, password: string, email: string) => {
    setError(null)
    try {
      const data = await authService.register(username, password, email)
      localStorage.setItem("token", data.token)
      setUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
      })
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrarse")
      throw err
    }
  }

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
