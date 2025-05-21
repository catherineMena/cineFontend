"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../../config/api"
import { useAuth } from "../../contexts/AuthContext"
import { FaArrowLeft, FaImage, FaFilm, FaChair } from "react-icons/fa"
import toast from "react-hot-toast"

const AdminCreateCinemaRoom = () => {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [movieTitle, setMovieTitle] = useState("")
  const [rows, setRows] = useState(5)
  const [columns, setColumns] = useState(8)
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !movieTitle || !posterFile) {
      toast.error("Por favor, completa todos los campos")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("name", name)
    formData.append("movieTitle", movieTitle)
    formData.append("rows", rows)
    formData.append("columns", columns)
    formData.append("poster", posterFile)

    try {
      await axios.post(`${API_URL}/api/cinemas`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Sala de cine creada exitosamente")
      navigate("/admin/cinema-rooms")
    } catch (error) {
      console.error("Error creating cinema room:", error)
      toast.error(error.response?.data?.message || "Error al crear la sala de cine")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/admin/cinema-rooms" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FaArrowLeft className="mr-2" /> Volver a salas de cine
      </Link>

      <h1 className="text-2xl font-bold mb-6">Crear Nueva Sala de Cine</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad de la Sala</label>
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
                <p className="mt-2 text-sm text-gray-500">Capacidad total: {rows * columns} asientos</p>
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
                          required
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-medium mb-4">Vista Previa</h3>

              {posterPreview ? (
                <div className="relative aspect-[2/3] w-full max-w-xs rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={posterPreview || "/placeholder.svg"}
                    alt="Vista previa del póster"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-gray-200 aspect-[2/3] w-full max-w-xs rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Vista previa del póster</p>
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
              {isSubmitting ? "Creando..." : "Crear Sala"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminCreateCinemaRoom
