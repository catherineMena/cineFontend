"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { API_URL } from "../../config/api"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import { FaFilm, FaUsers, FaTicketAlt, FaPlus, FaSpinner } from "react-icons/fa"

const AdminDashboard = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    totalCinemaRooms: 0,
    totalUsers: 0,
    totalReservations: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener salas de cine
        const cinemaRoomsResponse = await axios.get(`${API_URL}/api/cinemas`)

        // Obtener usuarios (solo admin)
        const usersResponse = await axios.get(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // En un sistema real, habría un endpoint para obtener estadísticas
        // Aquí simulamos el total de reservaciones
        const totalReservations = Math.floor(Math.random() * 100) + 50

        setStats({
          totalCinemaRooms: cinemaRoomsResponse.data.length,
          totalUsers: usersResponse.data.length,
          totalReservations,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Salas de Cine</h2>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaFilm className="text-blue-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalCinemaRooms}</p>
          <p className="text-gray-500">Salas activas</p>
          <Link to="/admin/cinema-rooms" className="mt-4 text-blue-600 hover:text-blue-800 inline-block">
            Ver detalles →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Usuarios</h2>
            <div className="p-3 bg-green-100 rounded-full">
              <FaUsers className="text-green-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalUsers}</p>
          <p className="text-gray-500">Usuarios registrados</p>
          <Link to="/admin/users" className="mt-4 text-green-600 hover:text-green-800 inline-block">
            Ver detalles →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Reservaciones</h2>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaTicketAlt className="text-purple-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalReservations}</p>
          <p className="text-gray-500">Reservaciones totales</p>
          <span className="mt-4 text-gray-400 inline-block">Estadísticas →</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/cinema-rooms/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FaPlus className="mr-2" /> Crear Nueva Sala
          </Link>
          <Link
            to="/admin/users"
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FaUsers className="mr-2" /> Gestionar Usuarios
          </Link>
          <Link
            to="/cinemas"
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FaFilm className="mr-2" /> Ver Películas
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-medium">Nueva sala creada: Sala VIP</p>
            <p className="text-sm text-gray-500">Hace 2 horas</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="font-medium">Nuevo usuario registrado: usuario123</p>
            <p className="text-sm text-gray-500">Hace 3 horas</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="font-medium">5 nuevas reservaciones realizadas</p>
            <p className="text-sm text-gray-500">Hace 5 horas</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
