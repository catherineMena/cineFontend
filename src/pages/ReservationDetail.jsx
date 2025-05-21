"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../config/api"
import { useAuth } from "../contexts/AuthContext"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import QRCode from "qrcode.react"
import Navbar from "../components/Navbar"
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  alpha,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarTodayIcon,
  LocalMovies as LocalMoviesIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
} from "@mui/icons-material"

// Función para generar un QR si no existe
const generateQRCode = (reservationData) => {
  const qrData = JSON.stringify({
    id: reservationData.id,
    cinemaRoomName: reservationData.cinemaRoomName,
    movieTitle: reservationData.movieTitle,
    reservationDate: reservationData.reservationDate,
    seats: reservationData.seats,
  })

  return qrData
}

const ReservationDetail = () => {
  const { id } = useParams()
  const { token } = useAuth()
  const [reservation, setReservation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qrValue, setQrValue] = useState("")
  const theme = useTheme()

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reservations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const reservationData = response.data
        setReservation(reservationData)

        // Generar QR si no existe
        if (!reservationData.qrCode || reservationData.qrCode.includes("undefined")) {
          const qrData = generateQRCode(reservationData)
          setQrValue(qrData)
        } else {
          setQrValue(reservationData.qrCode)
        }
      } catch (error) {
        console.error("Error fetching reservation:", error)
        setError("Error al cargar los detalles de la reservación. Por favor, intenta de nuevo más tarde.")

        // Datos de ejemplo en caso de error
        const mockReservation = {
          id: id,
          userId: 1,
          cinemaRoomId: 1,
          cinemaRoomName: "Sala Premium",
          movieTitle: "Avengers: Secret Wars",
          reservationDate: new Date().toISOString(),
          seats: ["0-0", "0-1", "0-2"],
          createdAt: new Date().toISOString(),
        }

        setReservation(mockReservation)
        setQrValue(generateQRCode(mockReservation))
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservation()
  }, [id, token])

  // Función para descargar el QR como imagen
  const downloadQRCode = () => {
    const canvas = document.getElementById("reservation-qr-code")
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `ticket-${reservation.id}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  // Formatear los asientos para mostrarlos
  const formatSeats = (seats) => {
    if (!seats) return []

    return seats.map((seat) => {
      const [row, col] = seat.split("-")
      const rowLetter = String.fromCharCode(65 + Number.parseInt(row))
      return `${rowLetter}${Number.parseInt(col) + 1}`
    })
  }

  // Verificar si la reservación es pasada o futura
  const isPast = reservation ? new Date(reservation.reservationDate) < new Date() : false

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </>
    )
  }

  if (error || !reservation) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ pt: 10, pb: 4 }}>
          <Paper sx={{ p: 3, bgcolor: "error.dark" }}>
            <Typography variant="h6">Error</Typography>
            <Typography>{error || "No se encontró la reservación solicitada."}</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/reservations"
              sx={{ mt: 2 }}
            >
              Volver a mis reservaciones
            </Button>
          </Paper>
        </Container>
      </>
    )
  }

  const formattedSeats = formatSeats(reservation.seats)

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 10, pb: 8 }}>
        <Button component={Link} to="/reservations" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
          Volver a mis reservaciones
        </Button>

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Detalles de la Reservación
        </Typography>

        <Grid container spacing={4}>
          {/* Información principal */}
          <Grid item xs={12} md={8}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: alpha(theme.palette.background.paper, 0.8),
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

              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    height: { xs: 200, sm: "auto" },
                    filter: isPast ? "grayscale(100%)" : "none",
                  }}
                  image={`https://i.ibb.co/Jy8Kx5T/avengers-secret-wars.jpg`}
                  alt={reservation.movieTitle}
                />

                <CardContent sx={{ flex: "1 0 auto", p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    {reservation.movieTitle}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                    <Chip
                      icon={<LocalMoviesIcon />}
                      label={reservation.cinemaRoomName}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<CalendarTodayIcon />}
                      label={format(new Date(reservation.reservationDate), "EEEE d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })}
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip icon={<AccessTimeIcon />} label="19:30" color="default" variant="outlined" />
                  </Box>

                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    <LocationOnIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                    Asientos
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    {formattedSeats.map((seat) => (
                      <Chip
                        key={seat}
                        label={seat}
                        color="primary"
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          opacity: isPast ? 0.7 : 1,
                        }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ID de Reservación: {reservation.id}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Creada el{" "}
                        {format(new Date(reservation.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                      </Typography>
                    </Box>

                    <Typography variant="h6" color={isPast ? "text.secondary" : "primary.main"} fontWeight="bold">
                      ${(formattedSeats.length * 8.5).toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Box>
            </Card>

            {/* Acciones */}
            <Paper
              elevation={3}
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Acciones
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadQRCode} disabled={isPast}>
                  Descargar QR
                </Button>
                <Button variant="outlined" startIcon={<PrintIcon />} disabled={isPast}>
                  Imprimir Ticket
                </Button>
                <Button variant="outlined" startIcon={<ShareIcon />} disabled={isPast}>
                  Compartir
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* QR Code */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <QrCodeIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Código QR
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: "white",
                  p: 3,
                  borderRadius: 2,
                  width: "100%",
                  maxWidth: 250,
                  mx: "auto",
                  mb: 3,
                  boxShadow: 2,
                  opacity: isPast ? 0.6 : 1,
                }}
              >
                <QRCode
                  id="reservation-qr-code"
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin
                  renderAs="canvas"
                  style={{ width: "100%", height: "auto" }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Presenta este código QR en la entrada del cine para acceder a la sala.
              </Typography>

              {isPast ? (
                <Chip label="Esta reservación ya ha expirado" color="error" variant="outlined" sx={{ mt: "auto" }} />
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={downloadQRCode}
                  sx={{ mt: "auto" }}
                >
                  Descargar QR
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default ReservationDetail
