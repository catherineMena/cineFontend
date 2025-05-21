"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../config/api"
import { useAuth } from "../contexts/AuthContext"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Navbar from "../components/Navbar"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
} from "@mui/material"
import {
  CalendarToday as CalendarTodayIcon,
  EventSeat as EventSeatIcon,
  Movie as MovieIcon,
  QrCode2 as QrCode2Icon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material"

// Lista de películas con URLs de imágenes públicas
const MOVIE_POSTERS = {
  "Avengers: Endgame": "https://i.ibb.co/Jy8Kx5T/avengers-secret-wars.jpg",
  "Star Wars": "https://i.ibb.co/Lk6ZyGM/avatar-3.jpg",
  "Black Panther": "https://i.ibb.co/YRKTt9M/black-panther-3.jpg",
  "Mission Impossible": "https://i.ibb.co/Jj1tHZG/mission-impossible-8.jpg",
  "Fantastic Four": "https://i.ibb.co/Lp7H0zn/fantastic-four.jpg",
  Blade: "https://i.ibb.co/YWBKpWL/blade.jpg",
  "Captain America": "https://i.ibb.co/Jj4vWsL/captain-america-brave-new-world.jpg",
  Thunderbolts: "https://i.ibb.co/Lk3Lq1S/thunderbolts.jpg",
  Dune: "https://i.ibb.co/YRKTt9M/dune-messiah.jpg",
  "Jurassic World": "https://i.ibb.co/YWBKpWL/jurassic-world-4.jpg",
}

// Función para obtener una imagen de póster basada en el título de la película
const getMoviePoster = (title) => {
  // Buscar coincidencias parciales en los títulos
  const matchingKey = Object.keys(MOVIE_POSTERS).find((key) => title.toLowerCase().includes(key.toLowerCase()))
  return matchingKey ? MOVIE_POSTERS[matchingKey] : "https://i.ibb.co/Jy8Kx5T/avengers-secret-wars.jpg"
}

const UserReservations = () => {
  const { token } = useAuth()
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const theme = useTheme()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reservations/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setReservations(response.data)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        setError("Error al cargar las reservaciones. Por favor, intenta de nuevo más tarde.")

        // Datos de ejemplo en caso de error
        setReservations([
          {
            id: 1,
            cinemaRoomId: 1,
            cinemaRoomName: "Sala Premium",
            movieTitle: "Avengers: Endgame",
            reservationDate: "2025-05-21T00:00:00.000Z",
            seats: ["0-0", "0-1", "0-2"],
            qrCode: "/qrcodes/reservation_1.png",
            createdAt: "2025-05-15T10:30:00.000Z",
          },
          {
            id: 2,
            cinemaRoomId: 2,
            cinemaRoomName: "Sala VIP",
            movieTitle: "Black Panther: Wakanda Forever",
            reservationDate: "2025-05-22T00:00:00.000Z",
            seats: ["1-3", "1-4"],
            qrCode: "/qrcodes/reservation_2.png",
            createdAt: "2025-05-16T14:45:00.000Z",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [token])

  // Separar reservaciones futuras y pasadas
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingReservations = reservations
    .filter((reservation) => new Date(reservation.reservationDate) >= today)
    .sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate))

  const pastReservations = reservations
    .filter((reservation) => new Date(reservation.reservationDate) < today)
    .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate))

  // Función para formatear los asientos
  const formatSeats = (seats) => {
    if (!seats) return []

    return seats.map((seat) => {
      const [row, col] = seat.split("-")
      const rowLetter = String.fromCharCode(65 + Number.parseInt(row))
      return `${rowLetter}${Number.parseInt(col) + 1}`
    })
  }

  // Componente de tarjeta de reservación
  const ReservationCard = ({ reservation, isPast }) => {
    const formattedSeats = formatSeats(reservation.seats)
    const reservationDate = new Date(reservation.reservationDate)

    return (
      <Card
        sx={{
          display: "flex",
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          opacity: isPast ? 0.7 : 1,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 6,
          },
          position: "relative",
        }}
      >
        {isPast && (
          <Box
            sx={{
              position: "absolute",
              top: 20,
              right: 0,
              bgcolor: "error.main",
              color: "white",
              py: 0.5,
              px: 2,
              zIndex: 1,
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              EXPIRADO
            </Typography>
          </Box>
        )}

        <CardMedia
          component="img"
          sx={{
            width: { xs: 120, sm: 150 },
            filter: isPast ? "grayscale(100%)" : "none",
          }}
          image={getMoviePoster(reservation.movieTitle)}
          alt={reservation.movieTitle}
        />

        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <CardContent sx={{ flex: "1 0 auto", pb: 1 }}>
            <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
              {reservation.movieTitle}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip
                icon={<MovieIcon fontSize="small" />}
                label={reservation.cinemaRoomName}
                size="small"
                color={isPast ? "default" : "primary"}
                variant="outlined"
              />
              <Chip
                icon={<CalendarTodayIcon fontSize="small" />}
                label={format(reservationDate, "EEE, d MMM yyyy", { locale: es })}
                size="small"
                color={isPast ? "default" : "secondary"}
                variant="outlined"
              />
              <Chip
                icon={<AccessTimeIcon fontSize="small" />}
                label="19:30"
                size="small"
                color={isPast ? "default" : "default"}
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <EventSeatIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Asientos: {formattedSeats.join(", ")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <QrCode2Icon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Código QR disponible
              </Typography>
            </Box>
          </CardContent>

          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <Button
              component={Link}
              to={`/reservations/${reservation.id}`}
              endIcon={<ArrowForwardIcon />}
              color={isPast ? "inherit" : "primary"}
              variant="text"
              size="small"
            >
              Ver Detalles
            </Button>
          </Box>
        </Box>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ pt: 10, pb: 8 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 10, pb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Mis Reservaciones
        </Typography>

        {error && (
          <Paper
            sx={{
              p: 2,
              mb: 4,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: "error.main",
              borderRadius: 2,
            }}
          >
            <Typography>{error}</Typography>
          </Paper>
        )}

        {reservations.length === 0 && !error ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <MovieIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No tienes reservaciones
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              ¡Reserva tus asientos para disfrutar de las mejores películas!
            </Typography>
            <Button component={Link} to="/cinema-rooms" variant="contained" color="primary" sx={{ mt: 2 }}>
              Ver Películas
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Próximas funciones */}
            <Grid item xs={12} md={upcomingReservations.length > 0 ? 8 : 12}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Próximas Funciones
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {upcomingReservations.length > 0 ? (
                  upcomingReservations.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} isPast={false} />
                  ))
                ) : (
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No tienes próximas funciones reservadas.
                    </Typography>
                    <Button component={Link} to="/cinema-rooms" variant="outlined" color="primary" sx={{ mt: 2 }}>
                      Explorar Películas
                    </Button>
                  </Paper>
                )}
              </Box>

              {/* Historial de reservaciones */}
              {pastReservations.length > 0 && (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <MovieIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      Historial de Reservaciones
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {pastReservations.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} isPast={true} />
                  ))}
                </Box>
              )}
            </Grid>

            {/* Resumen lateral (solo si hay reservaciones próximas) */}
            {upcomingReservations.length > 0 && (
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    position: "sticky",
                    top: 100,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Resumen de Reservaciones
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Próximas funciones
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {upcomingReservations.length}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total de asientos reservados
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {upcomingReservations.reduce((total, res) => total + (res.seats?.length || 0), 0)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Próxima función
                    </Typography>
                    {upcomingReservations.length > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography fontWeight="medium">
                          {format(new Date(upcomingReservations[0].reservationDate), "EEEE, d 'de' MMMM", {
                            locale: es,
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Button component={Link} to="/cinema-rooms" variant="contained" color="primary" fullWidth>
                    Reservar Más Películas
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </>
  )
}

export default UserReservations
