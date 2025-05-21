"use client"

import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { cinemaService, reservationService } from "../api/api"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material"
import { Movie as MovieIcon, Theaters as TheatersIcon, ConfirmationNumber as TicketIcon } from "@mui/icons-material"

interface CinemaRoom {
  id: number
  name: string
  movie_title: string
  movie_poster: string
  rows: number
  columns: number
  totalSeats: number
  availability: Record<string, number>
}

interface Reservation {
  id: number
  cinemaRoomId: number
  cinemaRoomName: string
  movieTitle: string
  reservationDate: string
  seats: string[]
  qrCode: string
  createdAt: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener salas de cine
        const cinemaData = await cinemaService.getAllCinemas()
        setCinemaRooms(cinemaData.slice(0, 3)) // Mostrar solo las 3 primeras

        // Obtener reservaciones del usuario
        const reservationData = await reservationService.getUserReservations()
        setReservations(reservationData.slice(0, 3)) // Mostrar solo las 3 primeras
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user?.username}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tarjetas de estadísticas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MovieIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {cinemaRooms.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Películas en cartelera
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TheatersIcon sx={{ fontSize: 40, color: "secondary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {cinemaRooms.reduce((total, room) => total + room.totalSeats, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Asientos disponibles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TicketIcon sx={{ fontSize: 40, color: "success.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {reservations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tus reservaciones
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Películas en cartelera */}
        <Grid item xs={12}>
          <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" component="div">
              Películas en Cartelera
            </Typography>
            <Button component={RouterLink} to="/cinemas" variant="outlined">
              Ver todas
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            {cinemaRooms.length > 0 ? (
              cinemaRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        room.movie_poster.startsWith("/uploads")
                          ? `http://localhost:3000${room.movie_poster}`
                          : room.movie_poster
                      }
                      alt={room.movie_title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {room.movie_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sala: {room.name}
                      </Typography>
                      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Chip
                          label={`${room.availability[today] || 0} asientos disponibles`}
                          color="primary"
                          size="small"
                        />
                        <Button component={RouterLink} to={`/cinemas/${room.id}`} size="small" variant="contained">
                          Reservar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No hay películas disponibles en este momento.</Alert>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Tus reservaciones */}
        <Grid item xs={12}>
          <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" component="div">
              Tus Reservaciones
            </Typography>
            <Button component={RouterLink} to="/reservations" variant="outlined">
              Ver todas
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <Grid item xs={12} sm={6} md={4} key={reservation.id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {reservation.movieTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sala: {reservation.cinemaRoomName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fecha: {new Date(reservation.reservationDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Asientos: {reservation.seats.join(", ")}
                      </Typography>
                      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          component={RouterLink}
                          to={`/reservations/${reservation.id}`}
                          size="small"
                          variant="outlined"
                        >
                          Ver Detalles
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No tienes reservaciones activas. ¡Reserva ahora!</Alert>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
