"use client"

import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { cinemaService } from "../api/api"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material"
import { Search as SearchIcon, Event as EventIcon, Chair as ChairIcon } from "@mui/icons-material"

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

const CinemaRooms = () => {
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([])
  const [filteredRooms, setFilteredRooms] = useState<CinemaRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchCinemaRooms = async () => {
      try {
        const data = await cinemaService.getAllCinemas()
        setCinemaRooms(data)
        setFilteredRooms(data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar las salas de cine")
      } finally {
        setLoading(false)
      }
    }

    fetchCinemaRooms()
  }, [])

  // Filtrar salas por título de película o nombre de sala
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRooms(cinemaRooms)
    } else {
      const filtered = cinemaRooms.filter(
        (room) =>
          room.movie_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRooms(filtered)
    }
  }, [searchTerm, cinemaRooms])

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
        Salas de Cine
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por título de película o nombre de sala"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={
                    room.movie_poster.startsWith("/uploads")
                      ? `http://localhost:3000${room.movie_poster}`
                      : room.movie_poster
                  }
                  alt={room.movie_title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {room.movie_title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Sala: {room.name}
                  </Typography>

                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <ChairIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Capacidad: {room.totalSeats} asientos</Typography>
                  </Box>

                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Disponibilidad: {Object.keys(room.availability).length} días
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Chip
                      label={`${room.availability[today] || 0} asientos disponibles hoy`}
                      color="primary"
                      size="small"
                    />
                    <Button component={RouterLink} to={`/cinemas/${room.id}`} variant="contained">
                      Reservar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No se encontraron salas de cine que coincidan con tu búsqueda.</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default CinemaRooms
