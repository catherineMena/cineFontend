import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api"

// Crear instancia de axios con URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Si el error es 401 (no autorizado), limpiar localStorage y redirigir a login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Servicios de autenticación
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password })
    return response.data
  },
  register: async (username: string, password: string, email: string) => {
    const response = await api.post("/auth/register", { username, password, email })
    return response.data
  },
  verifyToken: async () => {
    const response = await api.get("/auth/verify")
    return response.data
  },
}

// Servicios de salas de cine
export const cinemaService = {
  getAllCinemas: async () => {
    const response = await api.get("/cinemas")
    return response.data
  },
  getCinemaById: async (id: string) => {
    const response = await api.get(`/cinemas/${id}`)
    return response.data
  },
  createCinema: async (formData: FormData) => {
    const response = await api.post("/cinemas", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
  updateCinemaMovie: async (id: string, formData: FormData) => {
    const response = await api.put(`/cinemas/${id}/movie`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
  updateCinemaCapacity: async (id: string, rows: number, columns: number) => {
    const response = await api.put(`/cinemas/${id}/capacity`, { rows, columns })
    return response.data
  },
}

// Servicios de reservaciones
export const reservationService = {
  createReservation: async (cinemaRoomId: number, reservationDate: string, seats: string[]) => {
    const response = await api.post("/reservations", { cinemaRoomId, reservationDate, seats })
    return response.data
  },
  getUserReservations: async () => {
    const response = await api.get("/reservations/user")
    return response.data
  },
  getReservationById: async (id: string) => {
    const response = await api.get(`/reservations/${id}`)
    return response.data
  },
}

// Servicios de usuarios (admin)
export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/users")
    return response.data
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  deactivateUser: async (id: string) => {
    const response = await api.put(`/users/${id}/deactivate`)
    return response.data
  },
  activateUser: async (id: string) => {
    const response = await api.put(`/users/${id}/activate`)
    return response.data
  },
}

export default api
