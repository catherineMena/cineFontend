"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../../config/api"
import { useAuth } from "../../contexts/AuthContext"
import { FaPlus, FaEdit, FaFilm, FaSpinner, FaSearch } from "react-icons/fa"

const AdminCinemaRooms = () => {
  const { token } = useAuth()
  const [cinemaRooms, setCinemaRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCinemaRooms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cinemas`)
        setCinemaRooms(response.data)
        setFilteredRooms(response.data)
      } catch (error) {
        console.error("Error fetching cinema rooms:", error)
        setError("Error al cargar las salas de cine. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCinemaRooms()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRooms(cinemaRooms)
    } else {
      const filtered = cinemaRooms.filter(
        (room) =>
          room.movie_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRooms(filtered)
    }
  }, [searchTerm, cinemaRooms])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Salas de Cine</h1>
        <Link
          to="/admin/cinema-rooms/new"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Nueva Sala
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative w-full md:w-96 mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o película..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <FaFilm className="text-gray-400 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No se encontraron salas de cine</h2>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "No hay resultados para tu búsqueda." : "No hay salas de cine creadas."}
            </p>
            <Link
              to="/admin/cinema-rooms/new"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg inline-flex items-center transition-colors"
            >
              <FaPlus className="mr-2" /> Crear Nueva Sala
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Nombre</th>
                  <th className="py-3 px-4 text-left">Película</th>
                  <th className="py-3 px-4 text-left">Capacidad</th>
                  <th className="py-3 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{room.id}</td>
                    <td className="py-3 px-4">{room.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 overflow-hidden rounded">
                          <img
                            src={
                              room.movie_poster.startsWith("/uploads")
                                ? `${API_URL}${room.movie_poster}`
                                : room.movie_poster
                            }
                            alt={room.movie_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{room.movie_title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {room.rows} x {room.columns} ({room.rows * room.columns} asientos)
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/cinema-rooms/${room.id}`}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md inline-flex items-center transition-colors"
                      >
                        <FaEdit className="mr-1" /> Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCinemaRooms
