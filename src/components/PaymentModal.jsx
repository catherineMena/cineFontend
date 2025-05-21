"use client"

import { useState } from "react"
import { FaCreditCard, FaCalendarAlt, FaLock } from "react-icons/fa"

const PaymentModal = ({ isOpen, onClose, onConfirm, totalSeats, cinemaRoom, selectedDate }) => {
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulación de procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false)
      onConfirm()
    }, 1500)
  }

  if (!isOpen) return null

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return v
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isProcessing}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Completar Reservación</h2>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{cinemaRoom.movie_title}</h3>
          <p className="text-gray-600">Sala: {cinemaRoom.name}</p>
          <p className="text-gray-600">Fecha: {new Date(selectedDate).toLocaleDateString()}</p>
          <p className="text-gray-600">Asientos: {totalSeats}</p>
          <p className="font-bold text-lg mt-2">Total: ${totalSeats * 8.5}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Número de Tarjeta</label>
            <div className="relative">
              <FaCreditCard className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
                maxLength="19"
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nombre en la Tarjeta</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="NOMBRE APELLIDO"
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={isProcessing}
            />
          </div>

          <div className="flex space-x-4 mb-6">
            <div className="w-1/2">
              <label className="block text-gray-700 mb-2">Fecha de Expiración</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  maxLength="5"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 mb-2">CVV</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  placeholder="123"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  maxLength="3"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-bold ${
              isProcessing ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? "Procesando..." : "Confirmar Pago"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
