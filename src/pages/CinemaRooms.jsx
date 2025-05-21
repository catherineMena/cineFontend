"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../config/api"
import Navbar from "../components/Navbar"
import CinemaCard from "../components/CinemaCard"
import { FaSearch, FaSpinner } from "react-icons/fa"

const CinemaRooms = () => {
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

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Películas Disponibles</h1>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar películas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron películas que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((cinema) => (
              <CinemaCard key={cinema.id} cinema={cinema} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default CinemaRooms
