"use client"

import { useEffect, useState } from "react"
import { reservationService } from "../api/api"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { QRCodeSVG } from "qrcode.react"
import { Event as EventIcon, Theaters as TheatersIcon, Chair as ChairIcon } from "@mui/icons-material"

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

const UserReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await reservationService.getUserReservations()
        setReservations(data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar las reservaciones")
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  // Separar reservaciones futuras y pasadas
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingReservations = reservations
    .filter((reservation) => new Date(reservation.reservationDate) >= today)
    .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime())

  const pastReservations = reservations
    .filter((reservation) => new Date(reservation.reservationDate) < today)
    .sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime())

  // Abrir diálogo de QR
  const handleOpenQrDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setQrDialogOpen(true)
  }

  // Descargar código QR
  const handleDownloadQR = () => {
    if (!selectedReservation) return

    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (!canvas) return

    const pngUrl = canvas.toDataURL("image/png")
    const downloadLink = document.createElement("a")
    downloadLink.href = pngUrl
    downloadLink.download = `reservacion-${selectedReservation.id}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

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
        Mis Reservaciones
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reservations.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No tienes reservaciones. ¡Reserva ahora!
        </Alert>
      ) : (
        <>
          {/* Reservaciones próximas */}
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Próximas Reservaciones
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {upcomingReservations.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              No tienes reservaciones próximas.
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {upcomingReservations.map((reservation) => (
                <Grid item xs={12} sm={6} md={4} key={reservation.id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {reservation.movieTitle}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <TheatersIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                          Sala: {reservation.cinemaRoomName}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <EventIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                          Fecha: {format(new Date(reservation.reservationDate), "EEEE, d MMMM yyyy", { locale: es })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <ChairIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                          Asientos:{" "}
                          {reservation.seats
                            .map((seat) => {
                              const [row, col] = seat.split("-")
                              return `${String.fromCharCode(65 + Number.parseInt(row))}${Number.parseInt(col) + 1}`
                            })
                            .join(", ")}
                        </Typography>
                      </Box>

                      <Chip label="Próxima" color="primary" size="small" sx={{ mb: 2 }} />

                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" onClick={() => handleOpenQrDialog(reservation)}>
                          Ver Entrada
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Reservaciones pasadas */}
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Historial de Reservaciones
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {pastReservations.length === 0 ? (
            <Alert severity="info">No tienes reservaciones pasadas.</Alert>
          ) : (
            <Grid container spacing={3}>
              {pastReservations.map((reservation) => (
                <Grid item xs={12} sm={6} md={4} key={reservation.id}>
                  <Card sx={{ height: "100%", opacity: 0.7 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {reservation.movieTitle}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <TheatersIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Sala: {reservation.cinemaRoomName}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <EventIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Fecha: {format(new Date(reservation.reservationDate), "EEEE, d MMMM yyyy", { locale: es })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <ChairIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Asientos:{" "}
                          {reservation.seats
                            .map((seat) => {
                              const [row, col] = seat.split("-")
                              return `${String.fromCharCode(65 + Number.parseInt(row))}${Number.parseInt(col) + 1}`
                            })
                            .join(", ")}
                        </Typography>
                      </Box>

                      <Chip label="Pasada" color="default" size="small" sx={{ mb: 2 }} />

                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="outlined" onClick={() => handleOpenQrDialog(reservation)}>
                          Ver Detalles
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Diálogo de QR */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Reservación</DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
              <Box sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 2, width: "100%" }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Película:</strong> {selectedReservation.movieTitle}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Sala:</strong> {selectedReservation.cinemaRoomName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha:</strong>{" "}
                  {format(new Date(selectedReservation.reservationDate), "EEEE, d MMMM yyyy", { locale: es })}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Asientos:</strong>{" "}
                  {selectedReservation.seats
                    .map((seat) => {
                      const [row, col] = seat.split("-")
                      return `${String.fromCharCode(65 + Number.parseInt(row))}${Number.parseInt(col) + 1}`
                    })
                    .join(", ")}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>ID de Reservación:</strong> {selectedReservation.id}
                </Typography>
              </Box>

              <Typography variant="body1" gutterBottom>
                Código QR para tu entrada:
              </Typography>

              <Box sx={{ my: 2, p: 3, bgcolor: "white", borderRadius: 2 }}>
                <QRCodeSVG
                  id="qr-code-canvas"
                  value={JSON.stringify({
                    id: selectedReservation.id,
                    movie: selectedReservation.movieTitle,
                    room: selectedReservation.cinemaRoomName,
                    date: selectedReservation.reservationDate,
                    seats: selectedReservation.seats,
                  })}
                  size={200}
                  level="H"
                />
              </Box>

              <Button variant="outlined" onClick={handleDownloadQR} sx={{ mb: 2 }}>
                Descargar Código QR
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserReservations
