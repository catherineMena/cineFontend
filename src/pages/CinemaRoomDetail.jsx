"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../config/api"
import { useAuth } from "../contexts/AuthContext"
import Navbar from "../components/Navbar"
import SeatSelector from "../components/SeatSelector"
import PaymentModal from "../components/PaymentModal"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { FaCalendarAlt, FaSpinner, FaTicketAlt, FaCouch } from "react-icons/fa"
import toast from "react-hot-toast"

const CinemaRoomDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()

  const [cinemaRoom, setCinemaRoom] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedSeats, setSelectedSeats] = useState([])
  const [reservedSeats, setReservedSeats] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [reservationComplete, setReservationComplete] = useState(false)
  const [qrCode, setQrCode] = useState(null)

  // Generar fechas disponibles (próximos 8 días)
  const availableDates = Array.from({ length: 8 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEEE d MMMM", { locale: es }),
    }
  })

  useEffect(() => {
    const fetchCinemaRoom = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cinemas/${id}`)
        setCinemaRoom(response.data)
      } catch (error) {
        console.error("Error fetching cinema room:", error)
        setError("Error al cargar los detalles de la sala. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCinemaRoom()
  }, [id])

  useEffect(() => {
    if (cinemaRoom && selectedDate) {
      // Obtener los asientos reservados para la fecha seleccionada
      const reserved = cinemaRoom.reservedSeatsMap[selectedDate] || []
      setReservedSeats(reserved)
    }
  }, [cinemaRoom, selectedDate])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setSelectedSeats([])
  }

  const handleSeatSelect = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  const handleReservation = () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para reservar asientos")
      navigate("/login")
      return
    }

    if (selectedSeats.length === 0) {
      toast.error("Debes seleccionar al menos un asiento")
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentConfirm = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/reservations`,
        {
          cinemaRoomId: Number.parseInt(id),
          reservationDate: selectedDate,
          seats: selectedSeats,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setQrCode(response.data.reservation.qrCode)
      setReservationComplete(true)
      setShowPaymentModal(false)
      toast.success("¡Reservación completada con éxito!")

      // Actualizar los asientos reservados
      const updatedReservedSeats = [...reservedSeats, ...selectedSeats]
      setReservedSeats(updatedReservedSeats)
      setSelectedSeats([])
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast.error(error.response?.data?.message || "Error al crear la reservación")
      setShowPaymentModal(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </>
    )
  }

  if (error || !cinemaRoom) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error || "No se encontró la sala de cine"}</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Información de la película */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/3">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
              <img
                src={
                  cinemaRoom.movie_poster.startsWith("/uploads")
                    ? `${API_URL}${cinemaRoom.movie_poster}`
                    : cinemaRoom.movie_poster
                }
                alt={cinemaRoom.movie_title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{cinemaRoom.movie_title}</h1>
            <p className="text-gray-600 mb-4">Sala: {cinemaRoom.name}</p>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Selecciona una fecha
              </h2>

              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableDates.map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FaCouch className="text-green-500 mr-2" />
                  <span>{cinemaRoom.availability[selectedDate] || 0} asientos disponibles</span>
                </div>
                <div>
                  <span className="font-semibold">Capacidad total:</span> {cinemaRoom.totalSeats} asientos
                </div>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Asientos seleccionados:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => {
                    const [row, col] = seat.split("-")
                    const rowLetter = String.fromCharCode(65 + Number.parseInt(row))
                    return (
                      <span key={seat} className="bg-blue-200 px-2 py-1 rounded">
                        {rowLetter}
                        {Number.parseInt(col) + 1}
                      </span>
                    )
                  })}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <span className="font-semibold">Total:</span> ${selectedSeats.length * 8.5}
                  </div>
                  <button
                    onClick={handleReservation}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Reservar Asientos
                  </button>
                </div>
              </div>
            )}

            {reservationComplete && (
              <div className="bg-green-100 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                  <FaTicketAlt className="mr-2" /> ¡Reservación completada!
                </h3>
                <p className="mb-4">Tu reservación ha sido procesada con éxito.</p>
                {qrCode && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={`${API_URL}${qrCode}`}
                      alt="Código QR de reservación"
                      className="w-48 h-48 border-4 border-white shadow-lg"
                    />
                  </div>
                )}
                <div className="flex justify-center">
                  <a
                    href={`${API_URL}${qrCode}`}
                    download="ticket-qr.png"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Descargar Código QR
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selector de asientos */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Selecciona tus asientos</h2>
          <SeatSelector
            rows={cinemaRoom.rows}
            columns={cinemaRoom.columns}
            reservedSeats={reservedSeats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />
        </div>
      </div>

      {/* Modal de pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        totalSeats={selectedSeats.length}
        cinemaRoom={cinemaRoom}
        selectedDate={selectedDate}
      />
    </>
  )
}

export default CinemaRoomDetail
