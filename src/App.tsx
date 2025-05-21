"use client"

import type React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import CinemaRooms from "./pages/CinemaRooms"
import CinemaRoomDetail from "./pages/CinemaRoomDetail"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminCinemaRooms from "./pages/admin/AdminCinemaRooms"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminCreateCinemaRoom from "./pages/admin/AdminCreateCinemaRoom"
import AdminEditCinemaRoom from "./pages/admin/AdminEditCinemaRoom"
import UserReservations from "./pages/UserReservations"
import NotFound from "./pages/NotFound"
import { CircularProgress, Box } from "@mui/material"

// Protector de rutas para usuarios autenticados
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Protector de rutas para administradores
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return isAuthenticated && user?.role === "admin" ? <>{children}</> : <Navigate to="/dashboard" />
}

// Rutas públicas (redirige a dashboard si ya está autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas para usuarios */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cinemas"
        element={
          <PrivateRoute>
            <Layout>
              <CinemaRooms />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cinemas/:id"
        element={
          <PrivateRoute>
            <Layout>
              <CinemaRoomDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <PrivateRoute>
            <Layout>
              <UserReservations />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Rutas protegidas para administradores */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/cinemas"
        element={
          <AdminRoute>
            <Layout>
              <AdminCinemaRooms />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/cinemas/create"
        element={
          <AdminRoute>
            <Layout>
              <AdminCreateCinemaRoom />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/cinemas/:id/edit"
        element={
          <AdminRoute>
            <Layout>
              <AdminEditCinemaRoom />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <Layout>
              <AdminUsers />
            </Layout>
          </AdminRoute>
        }
      />

      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
