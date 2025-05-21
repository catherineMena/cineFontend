"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { API_URL } from "../config/api"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUser(response.data.user)
      } catch (error) {
        console.error("Error verifying token:", error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token])

  const login = async (username, password) => {
    setError(null)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      })

      const { token, user } = response.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)

      return user
    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Error al iniciar sesión")
      throw error
    }
  }

  const register = async (username, email, password) => {
    setError(null)
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
      })

      const { token, user } = response.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)

      return user
    } catch (error) {
      console.error("Register error:", error)
      setError(error.response?.data?.message || "Error al registrarse")
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
