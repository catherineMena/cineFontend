import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout.tsx';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CinemaRooms from './pages/CinemaRooms';
import CinemaRoomDetail from './pages/CinemaRoomDetail';
import UserProfile from './pages/UserProfile';
import UserReservations from './pages/UserReservations';
import ReservationDetail from './pages/ReservationDetail';
import SeatMap from './pages/SeatMap';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCinemaRooms from './pages/admin/AdminCinemaRooms';
import AdminCreateCinemaRoom from './pages/admin/AdminCreateCinemaRoom';
import AdminEditCinemaRoom from './pages/admin/AdminEditCinemaRoom';
import AdminUsers from './pages/admin/AdminUsers';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* Rutas protegidas para usuarios */}
              <Route path="cinemarooms" element={
                <ProtectedRoute>
                  <CinemaRooms />
                </ProtectedRoute>
              } />
              <Route path="cinemarooms/:id" element={
                <ProtectedRoute>
                  <CinemaRoomDetail />
                </ProtectedRoute>
              } />
              <Route path="seatmap/:cinemaId/:date" element={
                <ProtectedRoute>
                  <SeatMap />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="reservations" element={
                <ProtectedRoute>
                  <UserReservations />
                </ProtectedRoute>
              } />
              <Route path="reservations/:id" element={
                <ProtectedRoute>
                  <ReservationDetail />
                </ProtectedRoute>
              } />
              
              {/* Rutas de administrador */}
              <Route path="admin/dashboard" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/cinemarooms" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminCinemaRooms />
                </ProtectedRoute>
              } />
              <Route path="admin/cinemarooms/create" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminCreateCinemaRoom />
                </ProtectedRoute>
              } />
              <Route path="admin/cinemarooms/edit/:id" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminEditCinemaRoom />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              
              {/* Ruta 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;