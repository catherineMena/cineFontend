"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../config/api"
import { useAuth } from "../contexts/AuthContext"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FaTicketAlt, FaCalendarAlt, FaFilm, FaSpinner, FaQrcode } from "react-icons/fa"

const UserReservations = () => {
  const { token } = useAuth()
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reservations/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setReservations(response.data)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        setError("Error al cargar las reservaciones. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [token])

  // Separar reservaciones futuras y pasadas
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingReservations = reservations
    .filter((reservation) => new Date(reservation.reservationDate) >= today)
    .sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate))

  const pastReservations = reservations
    .filter((reservation) => new Date(reservation.reservationDate) < today)
    .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate))

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

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <FaTicketAlt className="text-gray-400 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No tienes reservaciones</h2>
        <p className="text-gray-500 mb-6">¡Reserva tus asientos para disfrutar de las mejores películas!</p>
        <Link
          to="/cinemas"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
        >
          Ver Películas
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Reservaciones</h1>

      {upcomingReservations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" /> Próximas Funciones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingReservations.map((reservation) => (
              <Link
                key={reservation.id}
                to={`/reservations/${reservation.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
              >
                <div className="p-4 flex items-start">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <FaQrcode className="text-blue-600 text-3xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{reservation.movieTitle}</h3>
                    <p className="text-gray-600 mb-1">Sala: {reservation.cinemaRoomName}</p>
                    <p className="text-gray-600 mb-2">
                      <FaCalendarAlt className="inline mr-1" />
                      {format(new Date(reservation.reservationDate), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {reservation.seats.map((seat) => {
                        const [row, col] = seat.split("-")
                        const rowLetter = String.fromCharCode(65 + Number.parseInt(row))
                        return (
                          <span key={seat} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {rowLetter}
                            {Number.parseInt(col) + 1}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Activa</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pastReservations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaFilm className="mr-2 text-gray-600" /> Historial de Reservaciones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastReservations.map((reservation) => (
              <Link
                key={reservation.id}
                to={`/reservations/${reservation.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 opacity-75"
              >
                <div className="p-4 flex items-start">
                  <div className="bg-gray-100 rounded-lg p-3 mr-4">
                    <FaQrcode className="text-gray-500 text-3xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{reservation.movieTitle}</h3>
                    <p className="text-gray-600 mb-1">Sala: {reservation.cinemaRoomName}</p>
                    <p className="text-gray-600 mb-2">
                      <FaCalendarAlt className="inline mr-1" />
                      {format(new Date(reservation.reservationDate), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {reservation.seats.map((seat) => {
                        const [row, col] = seat.split("-")
                        const rowLetter = String.fromCharCode(65 + Number.parseInt(row))
                        return (
                          <span key={seat} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {rowLetter}
                            {Number.parseInt(col) + 1}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Pasada</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserReservations
