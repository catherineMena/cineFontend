"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config/api"
import Navbar from "../components/Navbar"
import axios from "axios"
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
} from "@mui/material"
import {
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Star as StarIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material"

// Lista de películas "del 2025" con URLs de imágenes públicas
const MOVIE_POSTERS = [
  {
    id: 1,
    title: "Avengers: Secret Wars",
    poster: "https://i.ibb.co/Jy8Kx5T/avengers-secret-wars.jpg",
    rating: 9.2,
    genre: "Acción, Aventura, Sci-Fi",
    year: 2025,
  },
  {
    id: 2,
    title: "Avatar 3: The Seed Bearer",
    poster: "https://i.ibb.co/Lk6ZyGM/avatar-3.jpg",
    rating: 8.9,
    genre: "Acción, Aventura, Fantasía",
    year: 2025,
  },
  {
    id: 3,
    title: "Black Panther 3",
    poster: "https://i.ibb.co/YRKTt9M/black-panther-3.jpg",
    rating: 8.7,
    genre: "Acción, Aventura",
    year: 2025,
  },
  {
    id: 4,
    title: "Mission Impossible 8",
    poster: "https://i.ibb.co/Jj1tHZG/mission-impossible-8.jpg",
    rating: 8.5,
    genre: "Acción, Thriller, Espionaje",
    year: 2025,
  },
  {
    id: 5,
    title: "Fantastic Four",
    poster: "https://i.ibb.co/Lp7H0zn/fantastic-four.jpg",
    rating: 8.8,
    genre: "Acción, Aventura, Sci-Fi",
    year: 2025,
  },
  {
    id: 6,
    title: "Blade",
    poster: "https://i.ibb.co/YWBKpWL/blade.jpg",
    rating: 8.6,
    genre: "Acción, Horror, Fantasía",
    year: 2025,
  },
  {
    id: 7,
    title: "Captain America: Brave New World",
    poster: "https://i.ibb.co/Jj4vWsL/captain-america-brave-new-world.jpg",
    rating: 8.4,
    genre: "Acción, Aventura",
    year: 2025,
  },
  {
    id: 8,
    title: "Thunderbolts",
    poster: "https://i.ibb.co/Lk3Lq1S/thunderbolts.jpg",
    rating: 8.3,
    genre: "Acción, Aventura",
    year: 2025,
  },
  {
    id: 9,
    title: "Dune: Messiah",
    poster: "https://i.ibb.co/YRKTt9M/dune-messiah.jpg",
    rating: 9.0,
    genre: "Sci-Fi, Drama",
    year: 2025,
  },
  {
    id: 10,
    title: "Jurassic World 4",
    poster: "https://i.ibb.co/YWBKpWL/jurassic-world-4.jpg",
    rating: 8.1,
    genre: "Acción, Aventura, Sci-Fi",
    year: 2025,
  },
]

const CinemaRooms = () => {
  const [cinemaRooms, setCinemaRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const theme = useTheme()

  // Categorías para agrupar películas
  // const categories = [
  //   { id: "trending", name: "Tendencias ahora" },
  //   { id: "action", name: "Acción y aventura" },
  //   { id: "scifi", name: "Ciencia ficción" },
  //   { id: "fantasy", name: "Fantasía" },
  // ];

  useEffect(() => {
    const fetchCinemaRooms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cinemas`)

        // Combinar datos del backend con nuestras imágenes de películas
        const enhancedRooms = response.data.map((room, index) => {
          const movieData = MOVIE_POSTERS[index % MOVIE_POSTERS.length]
          return {
            ...room,
            movie_title: movieData.title,
            movie_poster: movieData.poster,
            rating: movieData.rating,
            genre: movieData.genre,
            year: movieData.year,
          }
        })

        setCinemaRooms(enhancedRooms)
        setFilteredRooms(enhancedRooms)
      } catch (error) {
        console.error("Error fetching cinema rooms:", error)
        setError("Error al cargar las salas de cine. Por favor, intenta de nuevo más tarde.")

        // Datos de ejemplo en caso de error
        const exampleData = MOVIE_POSTERS.map((movie, index) => ({
          id: index + 1,
          name: `Sala ${index + 1}`,
          movie_title: movie.title,
          movie_poster: movie.poster,
          rows: 8,
          columns: 10,
          totalSeats: 80,
          availability: { "2025-05-20": 50 },
          rating: movie.rating,
          genre: movie.genre,
          year: movie.year,
        }))

        setCinemaRooms(exampleData)
        setFilteredRooms(exampleData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCinemaRooms()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const filtered = cinemaRooms.filter(
        (room) =>
          room.movie_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.genre?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRooms(filtered)
    } else {
      setFilteredRooms(cinemaRooms)
    }
  }, [searchTerm, cinemaRooms])

  const handleRoomClick = (roomId) => {
    navigate(`/seat-map/${roomId}`)
  }

  // Componente de tarjeta de película estilo Netflix/TMDB
  const MovieCard = ({ movie }) => {
    const today = new Date().toISOString().split("T")[0]
    const availableSeats = movie.availability[today] || 0

    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          transition: "all 0.3s ease",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: 8,
            "& .MuiCardMedia-root": {
              transform: "scale(1.05)",
            },
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={movie.movie_poster}
            alt={movie.movie_title}
            sx={{
              height: 350,
              transition: "transform 0.5s ease",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: "rgba(0,0,0,0.7)",
              borderRadius: "50%",
              p: 0.5,
            }}
          >
            <IconButton size="small" color="primary">
              <BookmarkBorderIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              p: 1,
              background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2), transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <StarIcon sx={{ color: "gold", mr: 0.5 }} />
              <Typography variant="body2" fontWeight="bold">
                {movie.rating.toFixed(1)}/10
              </Typography>
            </Box>
            <Chip
              label={`${availableSeats} asientos`}
              size="small"
              color={availableSeats > 20 ? "success" : availableSeats > 10 ? "warning" : "error"}
              sx={{ height: 24 }}
            />
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom noWrap fontWeight="bold">
            {movie.movie_title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {movie.genre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sala: {movie.name}
          </Typography>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={() => handleRoomClick(movie.id)}
            sx={{ borderRadius: 6 }}
          >
            Reservar
          </Button>
        </CardActions>
      </Card>
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

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Navbar />

      {/* Contenido principal con padding-top para el navbar */}
      <Box sx={{ pt: 8, pb: 4 }}>
        {/* Banner principal */}
        <Box
          sx={{
            position: "relative",
            height: { xs: "50vh", md: "70vh" },
            mb: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }}
          >
            <Box
              component="img"
              src={filteredRooms[0]?.movie_poster || MOVIE_POSTERS[0].poster}
              alt="Featured Movie"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.7)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)",
              }}
            />
          </Box>

          <Container
            sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              pb: 4,
              zIndex: 1,
            }}
          >
            <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip label="ESTRENO" color="primary" size="small" sx={{ mr: 1 }} />
                <Chip label="2025" variant="outlined" size="small" sx={{ mr: 1 }} />
                <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                  <StarIcon sx={{ color: "gold", fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {filteredRooms[0]?.rating.toFixed(1) || "9.0"}/10
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {filteredRooms[0]?.movie_title || MOVIE_POSTERS[0].title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {filteredRooms[0]?.genre || MOVIE_POSTERS[0].genre} • Disfruta de la mejor experiencia cinematográfica
                en nuestra sala {filteredRooms[0]?.name || "Premium"}. Reserva tus asientos ahora y no te pierdas este
                estreno.
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => filteredRooms[0] && handleRoomClick(filteredRooms[0].id)}
                  sx={{ borderRadius: 6 }}
                >
                  Reservar
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  startIcon={<InfoIcon />}
                  sx={{
                    borderRadius: 6,
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: alpha("#ffffff", 0.1),
                    },
                  }}
                >
                  Más Info
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Contenedor principal */}
        <Container maxWidth="xl">
          {/* Barra de búsqueda */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h4" component="h2" fontWeight="bold">
              CinemaReserve
            </Typography>

            <TextField
              placeholder="Buscar películas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: alpha(theme.palette.common.white, 0.05),
                  borderRadius: 6,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                },
              }}
              sx={{ width: { xs: "100%", sm: 300 } }}
            />
          </Box>

          {/* Mensaje de error */}
          {error && (
            <Box sx={{ p: 2, mb: 4, bgcolor: "error.dark", borderRadius: 1 }}>
              <Typography>{error}</Typography>
            </Box>
          )}

          {/* Sin resultados */}
          {filteredRooms.length === 0 && !error && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <SearchIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No se encontraron películas
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Intenta con otra búsqueda
              </Typography>
              <Button variant="contained" color="primary" onClick={() => setSearchTerm("")}>
                Ver todas las películas
              </Button>
            </Box>
          )}

          {/* Lista de películas en grid */}
          {filteredRooms.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Películas en Cartelera
                </Typography>
                <Button color="primary" endIcon={<InfoIcon />}>
                  Ver todas
                </Button>
              </Box>

              <Grid container spacing={3}>
                {filteredRooms.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                    <MovieCard movie={movie} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  )
}

export default CinemaRooms
