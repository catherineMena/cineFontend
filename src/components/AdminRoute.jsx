"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Navbar from "./Navbar"
import Sidebar from "./admin/Sidebar"
import LoadingScreen from "./LoadingScreen"

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminRoute
