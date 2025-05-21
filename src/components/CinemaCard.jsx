import { Link } from "react-router-dom"
import { FaCalendarAlt, FaUsers } from "react-icons/fa"
import { API_URL } from "../config/api"

const CinemaCard = ({ cinema }) => {
  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]

  // Obtener la disponibilidad para hoy
  const availabilityToday = cinema.availability[today] || 0

  // Calcular el porcentaje de asientos disponibles
  const availabilityPercentage = Math.round((availabilityToday / cinema.totalSeats) * 100)

  return (
    <Link to={`/cinemas/${cinema.id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={
                cinema.movie_poster.startsWith("/uploads") ? `${API_URL}${cinema.movie_poster}` : cinema.movie_poster
              }
              alt={cinema.movie_title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white text-xl font-bold truncate">{cinema.movie_title}</h3>
            <p className="text-gray-300 text-sm">Sala: {cinema.name}</p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center text-gray-600">
              <FaUsers className="mr-1" />
              <span>{availabilityToday} asientos disponibles</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaCalendarAlt className="mr-1" />
              <span>{Object.keys(cinema.availability).length} días</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                availabilityPercentage > 60
                  ? "bg-green-600"
                  : availabilityPercentage > 30
                    ? "bg-yellow-500"
                    : "bg-red-600"
              }`}
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>

          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
            Ver Detalles
          </button>
        </div>
      </div>
    </Link>
  )
}

export default CinemaCard
