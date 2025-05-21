"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { FaFilm, FaTicketAlt, FaUserFriends } from "react-icons/fa"
import api from "../config/api" // Importación correcta

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        setIsLoading(true)
        // Usar la instancia de api en lugar de axios directamente
        const response = await api.get("/api/cinemas")
        // Obtener solo las primeras 3 películas para mostrar en la página de inicio
        setFeaturedMovies(response.data.slice(0, 3))
        setError(null)
      } catch (err) {
        console.error("Error fetching featured movies:", err)
        setError("No se pudieron cargar las películas. Por favor, intenta más tarde.")
        // Establecer datos de ejemplo para desarrollo
        setFeaturedMovies([
          {
            id: 1,
            name: "Sala 1",
            movie_title: "Película de Ejemplo 1",
            movie_poster: "https://via.placeholder.com/300x450?text=Película+1",
            rows: 8,
            columns: 10,
            totalSeats: 80,
            availability: { "2025-05-20": 50 },
          },
          {
            id: 2,
            name: "Sala 2",
            movie_title: "Película de Ejemplo 2",
            movie_poster: "https://via.placeholder.com/300x450?text=Película+2",
            rows: 6,
            columns: 8,
            totalSeats: 48,
            availability: { "2025-05-20": 30 },
          },
          {
            id: 3,
            name: "Sala VIP",
            movie_title: "Película de Ejemplo 3",
            movie_poster: "https://via.placeholder.com/300x450?text=Película+3",
            rows: 5,
            columns: 6,
            totalSeats: 30,
            availability: { "2025-05-20": 15 },
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedMovies()
  }, [])

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 py-24 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">La mejor experiencia cinematográfica</h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-8">
            Reserva tus asientos favoritos para las últimas películas y disfruta de una experiencia única.
          </p>
          <Link
            to="/cinemas"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
          >
            Ver Películas
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirnos?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaFilm className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Últimos Estrenos</h3>
              <p className="text-gray-600">
                Disfruta de las películas más recientes en nuestras modernas salas de cine.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaTicketAlt className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reserva Fácil</h3>
              <p className="text-gray-600">
                Selecciona tus asientos preferidos con nuestro sistema de reserva intuitivo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaUserFriends className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Experiencia Premium</h3>
              <p className="text-gray-600">Asientos cómodos, sonido envolvente y la mejor calidad de imagen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Movies Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Películas Destacadas</h2>
            <Link to="/cinemas" className="text-blue-600 hover:text-blue-800 font-medium">
              Ver todas
            </Link>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.movie_poster || "/placeholder.svg"}
                        alt={movie.movie_title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h3 className="text-white text-xl font-bold truncate">{movie.movie_title}</h3>
                      <p className="text-gray-300 text-sm">Sala: {movie.name}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center text-gray-600">
                        <span>{movie.availability["2025-05-20"] || 0} asientos disponibles</span>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para disfrutar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Regístrate ahora y comienza a reservar tus asientos para las mejores películas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors"
            >
              Crear Cuenta
            </Link>
            <Link
              to="/cinemas"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Ver Películas
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold flex items-center">
                <FaFilm className="mr-2" /> CinemaReserve
              </h3>
              <p className="text-gray-400 mt-2">© 2025 Todos los derechos reservados</p>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white">Términos</button>
              <button className="text-gray-400 hover:text-white">Privacidad</button>
              <button className="text-gray-400 hover:text-white">Contacto</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Home
