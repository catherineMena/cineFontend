"use client"

import { useState } from "react"
import { FaCouch, FaInfo } from "react-icons/fa"

const SeatSelector = ({ rows, columns, reservedSeats, selectedSeats, onSeatSelect }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null)

  // Crear un array de letras para las filas (A, B, C, etc.)
  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i))

  const handleSeatClick = (seatId) => {
    if (reservedSeats.includes(seatId)) return
    onSeatSelect(seatId)
  }

  const getSeatStatus = (seatId) => {
    if (reservedSeats.includes(seatId)) return "reserved"
    if (selectedSeats.includes(seatId)) return "selected"
    return "available"
  }

  const getSeatLabel = (rowIndex, colIndex) => {
    return `${rowLabels[rowIndex]}${colIndex + 1}`
  }

  return (
    <div className="seat-selector">
      {/* Pantalla */}
      <div className="screen-container mb-10 relative">
        <div className="screen bg-gradient-to-b from-white to-blue-200 h-8 w-4/5 mx-auto rounded-t-full shadow-lg transform perspective-500 rotateX-30 border border-blue-300">
          <p className="text-center text-gray-800 font-bold text-sm pt-1">PANTALLA</p>
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FaInfo className="text-blue-500" />
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center space-x-6 mb-8">
        <div className="flex items-center">
          <FaCouch className="text-gray-300 mr-2" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <FaCouch className="text-blue-500 mr-2" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center">
          <FaCouch className="text-red-500 mr-2" />
          <span>Reservado</span>
        </div>
      </div>

      {/* Contenedor de asientos */}
      <div className="seats-container bg-gray-900 p-8 rounded-lg">
        <div className="grid grid-cols-1 gap-y-2">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center">
              <div className="w-8 text-center text-white font-bold">{rowLabels[rowIndex]}</div>
              <div className="flex space-x-2 justify-center flex-1">
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const seatId = `${rowIndex}-${colIndex}`
                  const status = getSeatStatus(seatId)
                  const label = getSeatLabel(rowIndex, colIndex)

                  return (
                    <button
                      key={colIndex}
                      className={`seat relative transition-all duration-200 transform ${
                        hoveredSeat === seatId ? "scale-110" : ""
                      }`}
                      onClick={() => handleSeatClick(seatId)}
                      onMouseEnter={() => setHoveredSeat(seatId)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      disabled={status === "reserved"}
                      aria-label={`Asiento ${label} ${status === "reserved" ? "reservado" : status === "selected" ? "seleccionado" : "disponible"}`}
                    >
                      <FaCouch
                        className={`text-2xl ${
                          status === "reserved"
                            ? "text-red-500"
                            : status === "selected"
                              ? "text-blue-500"
                              : "text-gray-300 hover:text-gray-400"
                        }`}
                      />
                      {hoveredSeat === seatId && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                          {label}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="w-8 text-center text-white font-bold">{rowLabels[rowIndex]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SeatSelector
