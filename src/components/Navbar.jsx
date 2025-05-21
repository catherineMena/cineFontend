"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { FaUserCircle, FaSignOutAlt, FaTicketAlt, FaFilm, FaUserCog } from "react-icons/fa"

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-purple-900 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <FaFilm className="text-2xl" />
            <span className="text-xl font-bold">CinemaReserve</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/cinemas" className="hover:text-blue-200 transition-colors">
              Películas
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/reservations" className="hover:text-blue-200 transition-colors flex items-center">
                  <FaTicketAlt className="mr-1" /> Mis Reservas
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                    <FaUserCircle className="text-xl" />
                    <span>{user?.username}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-gray-800 hover:bg-blue-100 flex items-center">
                        <FaUserCog className="mr-2" /> Panel Admin
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md border border-white hover:bg-white hover:text-blue-900 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
