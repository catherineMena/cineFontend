"use client"

import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { cinemaService } from "../../api/api"
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
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Movie as MovieIcon,
  AspectRatio as AspectRatioIcon,
} from "@mui/icons-material"

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

const AdminCinemaRooms = () => {
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Salas de Cine
        </Typography>
        <Button component={RouterLink} to="/admin/cinemas/create" variant="contained" startIcon={<AddIcon />}>
          Nueva Sala
        </Button>
      </Box>

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
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Sala: {room.name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 2 }}>
                    <Chip label={`${room.rows} x ${room.columns}`} size="small" color="primary" sx={{ mr: 1 }} />
                    <Chip label={`${room.totalSeats} asientos`} size="small" color="secondary" />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Tooltip title="Editar película">
                      <IconButton
                        component={RouterLink}
                        to={`/admin/cinemas/${room.id}/edit`}
                        color="primary"
                        aria-label="editar película"
                      >
                        <MovieIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Editar capacidad">
                      <IconButton
                        component={RouterLink}
                        to={`/admin/cinemas/${room.id}/edit?tab=capacity`}
                        color="secondary"
                        aria-label="editar capacidad"
                      >
                        <AspectRatioIcon />
                      </IconButton>
                    </Tooltip>

                    <Button
                      component={RouterLink}
                      to={`/admin/cinemas/${room.id}/edit`}
                      variant="outlined"
                      startIcon={<EditIcon />}
                    >
                      Editar
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

export default AdminCinemaRooms
