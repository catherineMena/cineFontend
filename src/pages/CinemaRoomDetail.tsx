"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { cinemaService, reservationService } from "../api/api"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { es } from "date-fns/locale"
import { format, addDays } from "date-fns"
import { QRCodeSVG } from "qrcode.react"

interface CinemaRoom {
  id: number
  name: string
  movie_title: string
  movie_poster: string
  rows: number
  columns: number
  totalSeats: number
  availability: Record<string, number>
  reservedSeatsMap: Record<string, string[]>
}

interface ReservationResponse {
  id: number
  userId: number
  cinemaRoomId: number
  cinemaRoomName: string
  movieTitle: string
  reservationDate: string
  seats: string[]
  qrCode: string
}

const CinemaRoomDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cinemaRoom, setCinemaRoom] = useState<CinemaRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [reservedSeats, setReservedSeats] = useState<string[]>([])

  // Estados para el modal de pago
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Estados para el modal de confirmación
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [reservation, setReservation] = useState<ReservationResponse | null>(null)

  useEffect(() => {
    const fetchCinemaRoom = async () => {
      try {
        if (!id) return
        const data = await cinemaService.getCinemaById(id)
        setCinemaRoom(data)

        // Establecer asientos reservados para la fecha seleccionada
        if (selectedDate) {
          const dateStr = format(selectedDate, "yyyy-MM-dd")
          setReservedSeats(data.reservedSeatsMap[dateStr] || [])
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar los detalles de la sala")
      } finally {
        setLoading(false)
      }
    }

    fetchCinemaRoom()
  }, [id])

  // Actualizar asientos reservados cuando cambia la fecha
  useEffect(() => {
    if (cinemaRoom && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      setReservedSeats(cinemaRoom.reservedSeatsMap[dateStr] || [])
      setSelectedSeats([]) // Limpiar selección al cambiar de fecha
    }
  }, [selectedDate, cinemaRoom])

  // Manejar selección de asiento
  const handleSeatClick = (seatId: string) => {
    if (reservedSeats.includes(seatId)) {
      return // No permitir seleccionar asientos ya reservados
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  // Renderizar asientos
  const renderSeats = () => {
    if (!cinemaRoom) return null

    const seats = []

    // Añadir pantalla
    seats.push(
      <Box key="screen" sx={{ mb: 4 }}>
        <div className="screen">PANTALLA</div>
      </Box>,
    )

    // Añadir filas de asientos
    for (let i = 0; i < cinemaRoom.rows; i++) {
      const rowSeats = []

      for (let j = 0; j < cinemaRoom.columns; j++) {
        const seatId = `${i}-${j}`
        const isReserved = reservedSeats.includes(seatId)
        const isSelected = selectedSeats.includes(seatId)

        rowSeats.push(
          <Box
            key={seatId}
            className={`seat ${isReserved ? "reserved" : "available"} ${isSelected ? "selected" : ""}`}
            onClick={() => handleSeatClick(seatId)}
            sx={{
              backgroundColor: isReserved ? "#888" : isSelected ? "#e91e63" : "#444451",
              cursor: isReserved ? "not-allowed" : "pointer",
            }}
            aria-label={`Asiento ${String.fromCharCode(65 + i)}${j + 1}`}
          >
            {j + 1}
          </Box>,
        )
      }

      seats.push(
        <Box key={i} className="seat-row" sx={{ display: "flex", mb: 1 }}>
          <Box className="row-label">{String.fromCharCode(65 + i)}</Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>{rowSeats}</Box>
        </Box>,
      )
    }

    return seats
  }

  // Abrir modal de pago
  const handleOpenPaymentDialog = () => {
    if (selectedSeats.length === 0) {
      setError("Por favor selecciona al menos un asiento")
      return
    }

    setPaymentDialogOpen(true)
  }

  // Procesar pago y reservación
  const handlePayment = async () => {
    // Validar datos de tarjeta
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      setPaymentError("Por favor completa todos los campos")
      return
    }

    if (cardNumber.length < 16) {
      setPaymentError("Número de tarjeta inválido")
      return
    }

    setPaymentLoading(true)
    setPaymentError(null)

    try {
      if (!cinemaRoom || !selectedDate || !id) {
        throw new Error("Datos incompletos para la reservación")
      }

      const dateStr = format(selectedDate, "yyyy-MM-dd")

      // Crear reservación
      const response = await reservationService.createReservation(Number.parseInt(id), dateStr, selectedSeats)

      setReservation(response.reservation)
      setPaymentDialogOpen(false)
      setConfirmationDialogOpen(true)
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || "Error al procesar la reservación")
    } finally {
      setPaymentLoading(false)
    }
  }

  // Descargar código QR
  const handleDownloadQR = () => {
    if (!reservation) return

    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (!canvas) return

    const pngUrl = canvas.toDataURL("image/png")
    const downloadLink = document.createElement("a")
    downloadLink.href = pngUrl
    downloadLink.download = `reservacion-${reservation.id}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  // Finalizar proceso de reservación
  const handleFinishReservation = () => {
    setConfirmationDialogOpen(false)
    navigate("/reservations")
  }

  // Calcular rango de fechas disponibles (próximos 8 días)
  const minDate = new Date()
  const maxDate = addDays(new Date(), 7)

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !cinemaRoom) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!cinemaRoom) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        No se encontró la sala de cine
      </Alert>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información de la película */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={
                cinemaRoom.movie_poster.startsWith("/uploads")
                  ? `http://localhost:3000${cinemaRoom.movie_poster}`
                  : cinemaRoom.movie_poster
              }
              alt={cinemaRoom.movie_title}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {cinemaRoom.movie_title}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Sala: {cinemaRoom.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" gutterBottom>
                Capacidad: {cinemaRoom.totalSeats} asientos
              </Typography>
              <Typography variant="body2" gutterBottom>
                Distribución: {cinemaRoom.rows} filas x {cinemaRoom.columns} columnas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Selección de asientos */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Selección de Asientos
              </Typography>

              <Box sx={{ mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Selecciona una fecha"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    minDate={minDate}
                    maxDate={maxDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Fecha seleccionada: {selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: es }) : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Asientos disponibles:{" "}
                  {cinemaRoom.availability[selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""] || 0}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Paper elevation={3} sx={{ p: 3, width: "100%", maxWidth: 600, bgcolor: "background.default" }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}
                  >
                    {renderSeats()}
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box className="seat" sx={{ backgroundColor: "#444451", width: 20, height: 20 }} />
                    <Typography variant="body2">Disponible</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box className="seat" sx={{ backgroundColor: "#e91e63", width: 20, height: 20 }} />
                    <Typography variant="body2">Seleccionado</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box className="seat" sx={{ backgroundColor: "#888", width: 20, height: 20 }} />
                    <Typography variant="body2">Reservado</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  {selectedSeats.length > 0 && (
                    <>
                      <Typography variant="body1" gutterBottom>
                        Asientos seleccionados:{" "}
                        {selectedSeats
                          .map((seat) => {
                            const [row, col] = seat.split("-")
                            return `${String.fromCharCode(65 + Number.parseInt(row))}${Number.parseInt(col) + 1}`
                          })
                          .join(", ")}
                      </Typography>
                      <Typography variant="h6">Total: {selectedSeats.length} asiento(s)</Typography>
                    </>
                  )}
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  disabled={selectedSeats.length === 0}
                  onClick={handleOpenPaymentDialog}
                >
                  Continuar con la Reservación
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de pago */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Completar Reservación</DialogTitle>
        <DialogContent>
          {paymentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {paymentError}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de la Reservación
            </Typography>
            <Typography variant="body1" gutterBottom>
              Película: {cinemaRoom.movie_title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Sala: {cinemaRoom.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Fecha: {selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: es }) : ""}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Asientos:{" "}
              {selectedSeats
                .map((seat) => {
                  const [row, col] = seat.split("-")
                  return `${String.fromCharCode(65 + Number.parseInt(row))}${Number.parseInt(col) + 1}`
                })
                .join(", ")}
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Total: {selectedSeats.length} asiento(s)
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Información de Pago
          </Typography>

          <TextField
            margin="dense"
            label="Número de Tarjeta"
            type="text"
            fullWidth
            variant="outlined"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
            placeholder="1234 5678 9012 3456"
            inputProps={{ maxLength: 16 }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Nombre en la Tarjeta"
            type="text"
            fullWidth
            variant="outlined"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Fecha de Expiración (MM/AA)"
                type="text"
                fullWidth
                variant="outlined"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/AA"
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="CVV"
                type="text"
                fullWidth
                variant="outlined"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handlePayment} variant="contained" disabled={paymentLoading}>
            {paymentLoading ? "Procesando..." : "Completar Reservación"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>¡Reservación Exitosa!</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tu reservación ha sido confirmada
            </Typography>

            {reservation && (
              <>
                <Box sx={{ my: 3, p: 2, border: "1px solid #ddd", borderRadius: 2, width: "100%" }}>
                  <Typography variant="body1" gutterBottom>
                    Película: {reservation.movieTitle}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Sala: {reservation.cinemaRoomName}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Fecha: {format(new Date(reservation.reservationDate), "EEEE, d MMMM yyyy", { locale: es })}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Asientos:{" "}
                    {reservation.seats
                      .map((seat) => {
                        const [row, col] = seat.split("-")
                        return `${String.fromCharCode(65 + Number.parseInt(row))}${Number.parseInt(col) + 1}`
                      })
                      .join(", ")}
                  </Typography>
                </Box>

                <Typography variant="body1" gutterBottom>
                  Código QR para tu entrada:
                </Typography>

                <Box sx={{ my: 2, p: 3, bgcolor: "white", borderRadius: 2 }}>
                  <QRCodeSVG
                    id="qr-code-canvas"
                    value={JSON.stringify({
                      id: reservation.id,
                      movie: reservation.movieTitle,
                      room: reservation.cinemaRoomName,
                      date: reservation.reservationDate,
                      seats: reservation.seats,
                    })}
                    size={200}
                    level="H"
                  />
                </Box>

                <Button variant="outlined" onClick={handleDownloadQR} sx={{ mb: 2 }}>
                  Descargar Código QR
                </Button>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinishReservation} variant="contained">
            Ver Mis Reservaciones
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CinemaRoomDetail
