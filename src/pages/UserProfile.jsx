"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import Navbar from "../components/Navbar"
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  alpha,
  useTheme,
} from "@mui/material"
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  VpnKey as VpnKeyIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from "@mui/icons-material"

const UserProfile = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const theme = useTheme()

  // Si no hay usuario, mostrar mensaje de carga
  if (!user) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
          <Typography variant="h5" align="center">
            Cargando información del usuario...
          </Typography>
        </Container>
      </>
    )
  }

  // Datos del usuario (normalmente vendrían del contexto de autenticación)
  const userData = {
    username: user.username || "Usuario",
    email: user.email || "usuario@example.com",
    role: user.role || "client", // "admin" o "client"
    registeredDate: user.created_at || new Date().toISOString(),
    lastLogin: user.last_login || new Date().toISOString(),
    reservations: {
      active: 2,
      completed: 5,
      total: 7,
    },
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          {/* Cabecera del perfil */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                fontSize: 40,
                mr: { xs: 0, sm: 3 },
                mb: { xs: 2, sm: 0 },
              }}
            >
              {userData.username.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {userData.username}
                </Typography>
                <Chip
                  icon={userData.role === "admin" ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                  label={userData.role === "admin" ? "Administrador" : "Cliente"}
                  color={userData.role === "admin" ? "secondary" : "primary"}
                  sx={{ ml: 1 }}
                />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {userData.role === "admin"
                  ? "Acceso completo al sistema"
                  : `Miembro desde ${formatDate(userData.registeredDate)}`}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                <Chip icon={<EmailIcon />} label={userData.email} variant="outlined" sx={{ borderRadius: 1 }} />
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`Registrado: ${formatDate(userData.registeredDate)}`}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`Último acceso: ${formatDate(userData.lastLogin)}`}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Pestañas */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Información Personal" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Estadísticas" icon={<StarIcon />} iconPosition="start" />
              <Tab label="Preferencias" icon={<SettingsIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Contenido de las pestañas */}
          <Box sx={{ py: 3 }}>
            {/* Información Personal */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Detalles de la cuenta
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="Nombre de usuario" secondary={userData.username} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary="Correo electrónico" secondary={userData.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarTodayIcon />
                      </ListItemIcon>
                      <ListItemText primary="Fecha de registro" secondary={formatDate(userData.registeredDate)} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tipo de cuenta"
                        secondary={
                          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                            <Chip
                              size="small"
                              label={userData.role === "admin" ? "Administrador" : "Cliente"}
                              color={userData.role === "admin" ? "secondary" : "primary"}
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {userData.role === "admin"
                                ? "Acceso completo al sistema y panel de administración"
                                : "Acceso a reservaciones y funciones básicas"}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Seguridad
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Contraseña actual"
                      type="password"
                      fullWidth
                      margin="normal"
                      disabled
                      value="********"
                    />
                    <TextField label="Nueva contraseña" type="password" fullWidth margin="normal" />
                    <TextField label="Confirmar nueva contraseña" type="password" fullWidth margin="normal" />
                    <Button variant="contained" color="primary" startIcon={<VpnKeyIcon />} sx={{ mt: 2 }}>
                      Cambiar contraseña
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Estadísticas */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de reservaciones
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Card sx={{ minWidth: 200, flexGrow: 1 }}>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Reservaciones activas
                        </Typography>
                        <Typography variant="h3" component="div" color="primary">
                          {userData.reservations.active}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ minWidth: 200, flexGrow: 1 }}>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Reservaciones completadas
                        </Typography>
                        <Typography variant="h3" component="div" color="success.main">
                          {userData.reservations.completed}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ minWidth: 200, flexGrow: 1 }}>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Total de reservaciones
                        </Typography>
                        <Typography variant="h3" component="div">
                          {userData.reservations.total}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Nivel de cliente
                  </Typography>
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        {userData.role === "admin" ? (
                          <AdminPanelSettingsIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                        ) : (
                          <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                        )}
                        <Typography variant="h5">
                          {userData.role === "admin" ? "Administrador" : "Cliente Regular"}
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {userData.role === "admin"
                          ? "Tienes acceso completo al sistema, incluyendo el panel de administración y todas las funciones avanzadas."
                          : `Has realizado ${userData.reservations.total} reservaciones desde que te uniste el ${formatDate(
                              userData.registeredDate,
                            )}.`}
                      </Typography>
                      {userData.role === "client" && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Próximo nivel: Cliente Premium
                          </Typography>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                              borderRadius: 5,
                              mb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                height: "100%",
                                width: `${(userData.reservations.total / 10) * 100}%`,
                                bgcolor: theme.palette.primary.main,
                                borderRadius: 5,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {userData.reservations.total}/10 reservaciones para alcanzar el nivel Premium
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Películas favoritas
                  </Typography>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.4),
                      textAlign: "center",
                    }}
                  >
                    <MovieIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                    <Typography variant="body1" paragraph>
                      Aún no tienes películas favoritas.
                    </Typography>
                    <Button variant="outlined" startIcon={<MovieIcon />}>
                      Explorar películas
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Preferencias */}
            {tabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Notificaciones
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Notificaciones por email"
                        secondary="Recibe actualizaciones sobre tus reservaciones"
                      />
                      <FormControlLabel control={<Switch defaultChecked />} label="" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MovieIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Recordatorios de películas"
                        secondary="Recibe recordatorios antes de tus funciones"
                      />
                      <FormControlLabel control={<Switch defaultChecked />} label="" />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Tipo de cuenta
                  </Typography>
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        {userData.role === "admin" ? (
                          <AdminPanelSettingsIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                        ) : (
                          <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                        )}
                        <Box>
                          <Typography variant="h6">
                            {userData.role === "admin" ? "Administrador" : "Cliente"}
                          </Typography>
                          <Chip
                            size="small"
                            label={userData.role === "admin" ? "Privilegios avanzados" : "Cuenta estándar"}
                            color={userData.role === "admin" ? "secondary" : "default"}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {userData.role === "admin"
                          ? "Como administrador, tienes acceso completo al sistema, incluyendo la gestión de usuarios, salas de cine, películas y reservaciones."
                          : "Como cliente, puedes realizar reservaciones, ver tu historial y gestionar tu perfil."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="outlined" color="inherit" sx={{ mr: 1 }}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary">
              Guardar cambios
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export default UserProfile
