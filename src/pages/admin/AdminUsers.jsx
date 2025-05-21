"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { API_URL } from "../../config/api"
import { useAuth } from "../../contexts/AuthContext"
import { FaUsers, FaSpinner, FaSearch, FaUserCheck, FaUserTimes, FaUserCog } from "react-icons/fa"
import toast from "react-hot-toast"
import { FaCouch } from "react-icons/fa" // Import FaCouch for seat icons

const AdminUsers = () => {
  const { token, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUsers(response.data)
        setFilteredUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Error al cargar los usuarios. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [token])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (userId === currentUser.id) {
      toast.error("No puedes cambiar tu propio estado")
      return
    }

    setIsProcessing(true)

    try {
      const endpoint = currentStatus
        ? `${API_URL}/api/users/${userId}/deactivate`
        : `${API_URL}/api/users/${userId}/activate`

      await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Actualizar el estado del usuario en la lista
      setUsers(users.map((user) => (user.id === userId ? { ...user, active: !currentStatus } : user)))

      toast.success(`Usuario ${currentStatus ? "desactivado" : "activado"} exitosamente`)
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast.error("Error al cambiar el estado del usuario. Por favor, intenta de nuevo más tarde.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to render seat icons
  const renderSeatIcons = (seats) => {
    return seats.map((seat, index) => (
      <span
        key={index}
        style={{ color: seat.status === "available" ? "green" : seat.status === "selected" ? "blue" : "red" }}
      >
        <FaCouch /> {seat.code}
      </span>
    ))
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <FaUsers className="mr-2" /> Administración de Usuarios
        </h1>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div>
            <div className="mb-4 flex items-center">
              <FaSearch className="mr-2" />
              <input
                type="text"
                className="border p-2 rounded w-full"
                placeholder="Buscar usuarios por nombre o correo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{user.username}</h2>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center">
                    {user.active ? (
                      <FaUserCheck
                        className="text-green-500 mr-2 cursor-pointer"
                        onClick={() => handleToggleUserStatus(user.id, user.active)}
                      />
                    ) : (
                      <FaUserTimes
                        className="text-red-500 mr-2 cursor-pointer"
                        onClick={() => handleToggleUserStatus(user.id, user.active)}
                      />
                    )}
                    <FaUserCog className="text-gray-500 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
            {/* Render seat icons */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Visualización de Asientos</h2>
              <div className="flex flex-wrap gap-4">
                {renderSeatIcons([
                  { id: 1, code: "A1", status: "available" },
                  { id: 2, code: "A2", status: "selected" },
                  { id: 3, code: "A3", status: "reserved" },
                ])}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
