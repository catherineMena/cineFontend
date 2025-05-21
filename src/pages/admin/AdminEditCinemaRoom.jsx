"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../../config/api"
import { useAuth } from "../../contexts/AuthContext"
import { FaArrowLeft, FaImage, FaFilm, FaChair, FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"

const AdminEditCinemaRoom = () => {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [cinemaRoom, setCinemaRoom] = useState(null)
  const [name, setName] = useState("")
  const [movieTitle, setMovieTitle] = useState("")
  const [rows, setRows] = useState(0)
  const [columns, setColumns] = useState(0)
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("movie") // 'movie' or 'capacity'
  const [hasReservations, setHasReservations] = useState(false)

  useEffect(() => {
    const fetchCinemaRoom = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cinemas/${id}`)
        const room = response.data

        setCinemaRoom(room)
        setName(room.name)
        setMovieTitle(room.movie_title)
        setRows(room.rows)
        setColumns(room.columns)
        setPosterPreview(
          room.movie_poster.startsWith("/uploads") ? `${API_URL}${room.movie_poster}` : room.movie_poster,
        )

        // Verificar si hay reservaciones (si hay asientos reservados en cualquier fecha)
        const hasAnyReservations = Object.values(room.reservedSeatsMap).some((seats) => seats.length > 0)
        setHasReservations(hasAnyReservations)
      } catch (error) {
        console.error("Error fetching cinema room:", error)
        setError("Error al cargar los detalles de la sala. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCinemaRoom()
  }, [id])

  const handlePosterChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPosterFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPosterPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateMovie = async (e) => {
    e.preventDefault()

    if (!name || !movieTitle) {
      toast.error("Por favor, completa todos los campos")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("name", name)
    formData.append("movieTitle", movieTitle)
    if (posterFile) {
      formData.append("poster", posterFile)
    }

    try {
      await axios.put(`${API_URL}/api/cinemas/${id}/movie`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Información de la película actualizada exitosamente")
      navigate("/admin/cinema-rooms")
    } catch (error) {
      console.error("Error updating movie info:", error)
      toast.error(error.response?.data?.message || "Error al actualizar la información de la película")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCapacity = async (e) => {
    e.preventDefault()

    if (rows <= 0 || columns <= 0) {
      toast.error("Las filas y columnas deben ser mayores a cero")
      return
    }

    setIsSubmitting(true)

    try {
      await axios.put(
        `${API_URL}/api/cinemas/${id}/capacity`,
        {
          rows,
          columns,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      toast.success("Capacidad de la sala actualizada exitosamente")
      navigate("/admin/cinema-rooms")
    } catch (error) {
      console.error("Error updating capacity:", error)
      toast.error(error.response?.data?.message || "Error al actualizar la capacidad de la sala")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    )
  }

  if (error || !cinemaRoom) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error || "No se encontró la sala de cine"}</span>
      </div>
    )
  }

  return (
    <div>
      <Link to="/admin/cinema-rooms" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FaArrowLeft className="mr-2" /> Volver a salas de cine
      </Link>

      <h1 className="text-2xl font-bold mb-6">Editar Sala de Cine</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "movie"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("movie")}
            >
              Información de Película
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "capacity"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("capacity")}
              disabled={hasReservations}
            >
              Capacidad de Sala
              {hasReservations && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Bloqueado
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "movie" ? (
            <form onSubmit={handleUpdateMovie}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Sala
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFilm className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Ej: Sala Premium"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="movieTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Título de la Película
                    </label>
                    <input
                      type="text"
                      id="movieTitle"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Ej: Avengers: Endgame"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="poster" className="block text-sm font-medium text-gray-700 mb-1">
                      Póster de la Película
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="poster"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Seleccionar archivo</span>
                            <input
                              id="poster"
                              name="poster"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handlePosterChange}
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Deja este campo vacío para mantener el póster actual</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <h3 className="text-lg font-medium mb-4">Vista Previa</h3>

                  {posterPreview && (
                    <div className="relative aspect-[2/3] w-full max-w-xs rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={posterPreview || "/placeholder.svg"}
                        alt="Vista previa del póster"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Capacidad: {rows} filas x {columns} columnas
                    </p>
                    <p className="text-sm text-gray-500">Total: {rows * columns} asientos</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link
                  to="/admin/cinema-rooms"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg mr-4 transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-2 px-4 rounded-lg transition-colors`}
                >
                  {isSubmitting ? "Actualizando..." : "Actualizar Película"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {hasReservations ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No se puede modificar la capacidad porque esta sala tiene reservaciones activas.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateCapacity}>
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad de la Sala</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="rows" className="block text-xs text-gray-500 mb-1">
                            Filas
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaChair className="text-gray-400" />
                            </div>
                            <input
                              type="number"
                              id="rows"
                              value={rows}
                              onChange={(e) => setRows(Number.parseInt(e.target.value))}
                              min="1"
                              max="20"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="columns" className="block text-xs text-gray-500 mb-1">
                            Columnas
                          </label>
                          <input
                            type="number"
                            id="columns"
                            value={columns}
                            onChange={(e) => setColumns(Number.parseInt(e.target.value))}
                            min="1"
                            max="20"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Nueva capacidad total: {rows * columns} asientos</p>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to="/admin/cinema-rooms"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg mr-4 transition-colors"
                      >
                        Cancelar
                      </Link>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`${
                          isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                        } text-white py-2 px-4 rounded-lg transition-colors`}
                      >
                        {isSubmitting ? "Actualizando..." : "Actualizar Capacidad"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminEditCinemaRoom
