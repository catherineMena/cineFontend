"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_URL } from "../config/api"
import Navbar from "../components/Navbar"
import axios from "axios"
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  IconButton,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  EventSeat as EventSeatIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  LocalMovies as LocalMoviesIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material"
import toast from "react-hot-toast"

const SeatMap = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()

  const [cinemaRoom, setCinemaRoom] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [reservedSeats, setReservedSeats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Cambiar esta línea:
  // const [error, setError] = useState(null);
  // Por esta (si no se usa en ningún lugar):
  // const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [reservationComplete, setReservationComplete] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  // Datos para el formulario de pago
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [showCvv, setShowCvv] = useState(false)

  // Generar fechas disponibles (próximos 7 días)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
    }
  })

  useEffect(() => {
    const fetchCinemaRoom = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${API_URL}/api/cinemas/${roomId}`)
        setCinemaRoom(response.data)
        // Obtener asientos reservados para la fecha seleccionada
        setReservedSeats(response.data.reservedSeatsMap[selectedDate] || [])
      } catch (error) {
        console.error("Error fetching cinema room:", error)
        // setError("Error al cargar los detalles de la sala. Por favor, intenta de nuevo más tarde.")

        // Datos de ejemplo en caso de error
        setCinemaRoom({
          id: Number.parseInt(roomId),
          name: "Sala Premium",
          movie_title: "Avengers: Endgame",
          movie_poster: "https://via.placeholder.com/1000x1500?text=Avengers+Endgame",
          rows: 8,
          columns: 10,
          totalSeats: 80,
          reservedSeatsMap: {
            [selectedDate]: ["0-0", "1-2", "3-5", "4-4", "5-7"],
          },
        })
        setReservedSeats(["0-0", "1-2", "3-5", "4-4", "5-7"])
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId) {
      fetchCinemaRoom()
    } else {
      // setError("No se proporcionó un ID de sala válido")
      setIsLoading(false)
    }
  }, [roomId, selectedDate])

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value)
    setSelectedSeats([])
  }

  const handleSeatClick = (seatId) => {
    // No permitir seleccionar asientos ya reservados
    if (reservedSeats.includes(seatId)) {
      toast.error("Este asiento ya está reservado", {
        icon: "🚫",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })
      return
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  const handleReservation = () => {
    if (selectedSeats.length === 0) {
      toast.error("Por favor, selecciona al menos un asiento", {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentConfirm = async () => {
    setIsSubmitting(true)

    try {
      // Simulación de procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 1500))

      await axios.post(
        `${API_URL}/api/reservations`,
        {
          cinemaRoomId: cinemaRoom.id,
          reservationDate: selectedDate,
          seats: selectedSeats,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      setReservationComplete(true)
      setShowPaymentModal(false)

      toast.success("¡Reservación completada con éxito!", {
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })

      // Actualizar los asientos reservados
      setReservedSeats((prev) => [...prev, ...selectedSeats])
      setSelectedSeats([])

      // Redirigir a la página de confirmación o de reservaciones después de un tiempo
      setTimeout(() => {
        navigate("/reservations")
      }, 3000)
    } catch (error) {
      console.error("Error creating reservation:", error)

      if (error.response?.status === 400 && error.response?.data?.conflictingSeats) {
        toast.error("Algunos asientos ya han sido reservados por otro usuario", {
          icon: "❌",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        })
        // Actualizar los asientos reservados con los conflictivos
        setReservedSeats((prev) => [...prev, ...error.response.data.conflictingSeats])
        // Quitar los asientos conflictivos de la selección
        setSelectedSeats((prev) => prev.filter((seat) => !error.response.data.conflictingSeats.includes(seat)))
      } else {
        toast.error("Error al crear la reservación. Por favor, intenta de nuevo.", {
          icon: "❌",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para convertir ID de asiento a etiqueta legible (ej: "0-0" a "A1")
  const getSeatLabel = (seatId) => {
    const [row, col] = seatId.split("-")
    const rowLetter = String.fromCharCode(65 + Number.parseInt(row))
    return `${rowLetter}${Number.parseInt(col) + 1}`
  }

  // Función para obtener el estado de un asiento
  const getSeatStatus = (rowIndex, colIndex) => {
    const seatId = `${rowIndex}-${colIndex}`
    if (reservedSeats.includes(seatId)) return "reserved"
    if (selectedSeats.includes(seatId)) return "selected"
    return "available"
  }

  // Función para renderizar el mapa de asientos
  const renderSeatMap = () => {
    if (!cinemaRoom) return null

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          overflowX: "auto",
          py: 4,
        }}
      >
        {/* Pantalla */}
        <Box
          sx={{
            width: "80%",
            maxWidth: 800,
            height: 50,
            mb: 6,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: "absolute",
              borderBottom: "2px solid #666",
              borderBottomLeftRadius: "50%",
              borderBottomRightRadius: "50%",
              transform: "rotate(180deg)",
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              position: "relative",
              top: -15,
            }}
          >
            PANTALLA
          </Typography>
        </Box>

        {/* Mapa de asientos */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "fit-content",
            maxWidth: "100%",
          }}
        >
          {Array.from({ length: cinemaRoom.rows }).map((_, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Etiqueta de fila */}
              <Typography
                variant="body2"
                sx={{
                  width: 30,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {String.fromCharCode(65 + rowIndex)}
              </Typography>

              {/* Asientos */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {Array.from({ length: cinemaRoom.columns }).map((_, colIndex) => {
                  const status = getSeatStatus(rowIndex, colIndex)
                  const seatId = `${rowIndex}-${colIndex}`
                  const seatLabel = getSeatLabel(seatId)

                  return (
                    <Box
                      key={colIndex}
                      onClick={() => handleSeatClick(seatId)}
                      sx={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: status === "reserved" ? "not-allowed" : "pointer",
                        borderRadius: "4px",
                        border: "1px solid",
                        borderColor:
                          status === "reserved"
                            ? "transparent"
                            : status === "selected"
                              ? "primary.main"
                              : alpha(theme.palette.common.white, 0.3),
                        bgcolor:
                          status === "reserved"
                            ? alpha(theme.palette.common.white, 0.1)
                            : status === "selected"
                              ? "primary.main"
                              : "transparent",
                        color:
                          status === "reserved"
                            ? alpha(theme.palette.common.white, 0.3)
                            : status === "selected"
                              ? "white"
                              : alpha(theme.palette.common.white, 0.7),
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor:
                            status === "reserved"
                              ? alpha(theme.palette.common.white, 0.1)
                              : status === "selected"
                                ? "primary.dark"
                                : alpha(theme.palette.common.white, 0.1),
                          transform: status !== "reserved" ? "scale(1.1)" : "none",
                        },
                        position: "relative",
                      }}
                    >
                      <Typography variant="caption" fontWeight="medium">
                        {seatLabel}
                      </Typography>
                      {status === "reserved" && (
                        <Box
                          sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: "80%",
                              height: 2,
                              bgcolor: alpha(theme.palette.common.white, 0.3),
                              transform: "rotate(45deg)",
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>

              {/* Etiqueta de fila (derecha) */}
              <Typography
                variant="body2"
                sx={{
                  width: 30,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {String.fromCharCode(65 + rowIndex)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

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

  if (!cinemaRoom) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ pt: 10, pb: 4 }}>
          <Paper sx={{ p: 3, bgcolor: "error.dark" }}>
            <Typography variant="h6">Error</Typography>
            <Typography>No se encontró la sala de cine solicitada.</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/cinema-rooms")}
              sx={{ mt: 2 }}
            >
              Volver a salas de cine
            </Button>
          </Paper>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          pt: 8,
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Botón de regreso */}
          <Button
            variant="text"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/cinema-rooms")}
            sx={{ mb: 2 }}
          >
            Volver a salas de cine
          </Button>

          {/* Información de la película */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: 2,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} md={3}>
                <Box
                  component="img"
                  src={
                    cinemaRoom.movie_poster.startsWith("/uploads")
                      ? `${API_URL}${cinemaRoom.movie_poster}`
                      : cinemaRoom.movie_poster
                  }
                  alt={cinemaRoom.movie_title}
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 1,
                    boxShadow: 3,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8} md={9}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                  {cinemaRoom.movie_title}
                </Typography>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Sala: {cinemaRoom.name}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Selecciona una fecha
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="date-select-label">Fecha</InputLabel>
                    <Select
                      labelId="date-select-label"
                      id="date-select"
                      value={selectedDate}
                      onChange={handleDateChange}
                      label="Fecha"
                      startAdornment={
                        <InputAdornment position="start">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      }
                    >
                      {availableDates.map((date) => (
                        <MenuItem key={date.value} value={date.value}>
                          {date.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Chip
                      label={`${cinemaRoom.totalSeats - reservedSeats.length} asientos disponibles`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip label={`${cinemaRoom.totalSeats} asientos totales`} color="default" variant="outlined" />
                  </Box>
                </Box>

                {selectedSeats.length > 0 && (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      mt: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      Asientos seleccionados:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      {selectedSeats.map((seat) => (
                        <Chip
                          key={seat}
                          label={getSeatLabel(seat)}
                          color="primary"
                          onDelete={() => handleSeatClick(seat)}
                        />
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6">Total: ${(selectedSeats.length * 8.5).toFixed(2)}</Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<EventSeatIcon />}
                        onClick={handleReservation}
                      >
                        Reservar Asientos
                      </Button>
                    </Box>
                  </Paper>
                )}

                {reservationComplete && (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      mt: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="success.main">
                        ¡Reservación completada!
                      </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                      Tu reservación ha sido procesada con éxito. Puedes ver los detalles en tu sección de
                      reservaciones.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => navigate("/reservations")}
                      startIcon={<EventSeatIcon />}
                    >
                      Ver Mis Reservaciones
                    </Button>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Leyenda */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              <InfoIcon sx={{ verticalAlign: "middle", mr: 1 }} />
              Haz clic en los asientos para seleccionarlos
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
                mt: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                    borderRadius: 1,
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Disponible</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 1,
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Seleccionado</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    borderRadius: 1,
                    mr: 1,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      width: "80%",
                      height: 2,
                      bgcolor: alpha(theme.palette.common.white, 0.3),
                      top: "50%",
                      left: "10%",
                      transform: "rotate(45deg)",
                    }}
                  />
                </Box>
                <Typography variant="body2">Reservado</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Mapa de asientos */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom align="center" fontWeight="bold">
              <LocalMoviesIcon sx={{ verticalAlign: "middle", mr: 1 }} />
              Selecciona tus asientos
            </Typography>
            <Divider sx={{ width: "100%", mb: 4 }} />
            {renderSeatMap()}
          </Paper>
        </Container>
      </Box>

      {/* Modal de pago */}
      <Dialog
        open={showPaymentModal}
        onClose={() => !isSubmitting && setShowPaymentModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PaymentIcon sx={{ mr: 1 }} />
            Completar Reservación
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              {cinemaRoom.movie_title}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Sala: {cinemaRoom.name}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Fecha: {new Date(selectedDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Asientos: {selectedSeats.map((seat) => getSeatLabel(seat)).join(", ")}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total: ${(selectedSeats.length * 8.5).toFixed(2)}
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Información de Pago
          </Typography>

          <TextField
            fullWidth
            label="Número de Tarjeta"
            variant="outlined"
            margin="normal"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon />
                </InputAdornment>
              ),
            }}
            placeholder="1234 5678 9012 3456"
            required
          />

          <TextField
            fullWidth
            label="Nombre en la Tarjeta"
            variant="outlined"
            margin="normal"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="NOMBRE APELLIDO"
            required
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha de Expiración"
                variant="outlined"
                margin="normal"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                variant="outlined"
                margin="normal"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                type={showCvv ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCvv(!showCvv)} edge="end">
                        {showCvv ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="123"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentModal(false)} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handlePaymentConfirm}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
          >
            {isSubmitting ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SeatMap
