import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import CinemaRooms from "./pages/CinemaRooms"
import CinemaRoomDetail from "./pages/CinemaRoomDetail"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminCinemaRooms from "./pages/admin/AdminCinemaRooms"
import AdminCreateCinemaRoom from "./pages/admin/AdminCreateCinemaRoom"
import AdminEditCinemaRoom from "./pages/admin/AdminEditCinemaRoom"
import AdminUsers from "./pages/admin/AdminUsers"
import UserReservations from "./pages/UserReservations"
import ReservationDetail from "./pages/ReservationDetail"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cinemas" element={<CinemaRooms />} />
          <Route path="/cinemas/:id" element={<CinemaRoomDetail />} />

          {/* Protected routes (require authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Navigate to="/reservations" replace />} />
            <Route path="/reservations" element={<UserReservations />} />
            <Route path="/reservations/:id" element={<ReservationDetail />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cinema-rooms" element={<AdminCinemaRooms />} />
            <Route path="/admin/cinema-rooms/new" element={<AdminCreateCinemaRoom />} />
            <Route path="/admin/cinema-rooms/:id" element={<AdminEditCinemaRoom />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
