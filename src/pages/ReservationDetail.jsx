"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../config/api"
import { useAuth } from "../contexts/AuthContext"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FaTicketAlt, FaCalendarAlt, FaFilm, FaSpinner, FaArrowLeft, FaDownload, FaMapMarkerAlt } from "react-icons/fa"

const ReservationDetail = () => {
  const { id } = useParams()
  const { token } = useAuth()
  const [reservation, setReservation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reservations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setReservation(response.data)
      } catch (error) {
        console.error("Error fetching reservation:", error)
        setError("Error al cargar los detalles de la reservación. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservation()
  }, [id, token])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error || "No se encontró la reservación"}</span>
      </div>
    )
  }

  // Verificar si la reservación es pasada o futura
  const isPast = new Date(reservation.reservationDate) < new Date()

  // Formatear los asientos para mostrarlos
  const formattedSeats = reservation.seats
    .map((seat) => {
      const [row, col] = seat.split("-")
      const rowLetter = String.fromCharCode(65 + Number.parseInt(row))
      return `${rowLetter}${Number.parseInt(col) + 1}`
    })
    .join(", ")

  return (
    <div>
      <Link to="/reservations" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FaArrowLeft className="mr-2" /> Volver a mis reservaciones
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`p-4 text-white ${isPast ? "bg-gray-700" : "bg-blue-600"}`}>
          <h1 className="text-2xl font-bold flex items-center">
            <FaTicketAlt className="mr-2" /> Detalles de la Reservación
          </h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">{reservation.movieTitle}</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FaFilm className="text-gray-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold">Sala</h3>
                    <p>{reservation.cinemaRoomName}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaCalendarAlt className="text-gray-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold">Fecha</h3>
                    <p>{format(new Date(reservation.reservationDate), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold">Asientos</h3>
                    <p>{formattedSeats}</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-500">
                    Reservación creada el{" "}
                    {format(new Date(reservation.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-500">ID de reservación: {reservation.id}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4">
                <img src={`${API_URL}${reservation.qrCode}`} alt="Código QR de reservación" className="w-48 h-48" />
              </div>

              <a
                href={`${API_URL}${reservation.qrCode}`}
                download={`ticket-${reservation.id}.png`}
                className={`flex items-center ${
                  isPast ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
                } text-white font-bold py-2 px-4 rounded transition-colors`}
              >
                <FaDownload className="mr-2" /> Descargar Código QR
              </a>

              <p className="text-sm text-gray-500 mt-4 text-center">Presenta este código QR en la entrada del cine</p>
            </div>
          </div>
        </div>

        {isPast && (
          <div className="bg-gray-100 p-4 border-t border-gray-200">
            <p className="text-center text-gray-600">Esta reservación ya ha pasado. Gracias por tu visita.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReservationDetail
