"use client"

import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { cinemaService, userService } from "../../api/api"
import { Box, Typography, Grid, Card, CardContent, Button, Divider, CircularProgress, Alert } from "@mui/material"
import { Movie as MovieIcon, People as PeopleIcon, Theaters as TheatersIcon, Add as AddIcon } from "@mui/icons-material"

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

interface User {
  id: number
  username: string
  email: string
  role: string
  active: boolean
  created_at: string
}

const AdminDashboard = () => {
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener salas de cine
        const cinemaData = await cinemaService.getAllCinemas()
        setCinemaRooms(cinemaData)

        // Obtener usuarios
        const userData = await userService.getAllUsers()
        setUsers(userData)
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  // Estadísticas
  const totalCinemaRooms = cinemaRooms.length
  const totalSeats = cinemaRooms.reduce((total, room) => total + room.totalSeats, 0)
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.active).length

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Panel de Administración
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

      <Grid container spacing={3}>
        {/* Tarjetas de estadísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TheatersIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {totalCinemaRooms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Salas de Cine
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MovieIcon sx={{ fontSize: 40, color: "secondary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {totalSeats}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Asientos Totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon sx={{ fontSize: 40, color: "success.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios Totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon sx={{ fontSize: 40, color: "info.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones rápidas */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Acciones Rápidas
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Gestionar Salas de Cine
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Administra las salas de cine, películas y capacidad.
                  </Typography>
                  <Button component={RouterLink} to="/admin/cinemas" variant="contained" fullWidth>
                    Ir a Salas
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Gestionar Usuarios
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Administra los usuarios, activa o desactiva cuentas.
                  </Typography>
                  <Button component={RouterLink} to="/admin/users" variant="contained" fullWidth>
                    Ir a Usuarios
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Crear Nueva Sala
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Añade una nueva sala de cine con película y capacidad.
                  </Typography>
                  <Button component={RouterLink} to="/admin/cinemas/create" variant="contained" fullWidth>
                    Crear Sala
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard
