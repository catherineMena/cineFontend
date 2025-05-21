"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material"
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Close as CloseIcon,
} from "@mui/icons-material"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [isScrolled, setIsScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Detectar scroll para cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuAnchor(null)
    navigate("/login")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setIsSearchOpen(false)
    }
  }

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setDrawerOpen(open)
  }

  // Determinar si estamos en la página de inicio o login para usar un navbar transparente
  const isHomePage = location.pathname === "/home"
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register"

  // No mostrar navbar en páginas de autenticación
  if (isAuthPage) return null

  return (
    <>
      <AppBar
        position="fixed"
        elevation={isScrolled ? 4 : 0}
        sx={{
          backgroundColor: isScrolled || !isHomePage ? "rgba(0, 0, 0, 0.9)" : "transparent",
          backgroundImage:
            !isScrolled && isHomePage
              ? "linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)"
              : "none",
          transition: "background-color 0.3s ease",
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h5"
            component={RouterLink}
            to="/home"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textDecoration: "none",
              mr: 3,
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            CinemaReserve
          </Typography>

          {/* Navegación principal - solo en desktop */}
          {!isMobile && (
            <Box sx={{ display: "flex", mr: 2 }}>
              <Button
                component={RouterLink}
                to="/cinema-rooms"
                color="inherit"
                sx={{
                  mr: 1,
                  color: location.pathname === "/cinema-rooms" ? "white" : "text.secondary",
                  "&:hover": { color: "white" },
                }}
              >
                Películas
              </Button>
              {isAuthenticated && (
                <Button
                  component={RouterLink}
                  to="/reservations"
                  color="inherit"
                  sx={{
                    color: location.pathname === "/reservations" ? "white" : "text.secondary",
                    "&:hover": { color: "white" },
                  }}
                >
                  Mis Reservas
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Búsqueda */}
          <Box sx={{ position: "relative", mr: 2 }}>
            {isSearchOpen ? (
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  position: "relative",
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.25),
                  },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <InputBase
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    color: "inherit",
                    padding: theme.spacing(1, 1, 1, 0),
                    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                    transition: theme.transitions.create("width"),
                    width: { xs: "100%", sm: "12ch", md: "20ch" },
                    "&:focus": {
                      width: { sm: "20ch", md: "30ch" },
                    },
                  }}
                  autoFocus
                />
                <Box
                  sx={{
                    padding: theme.spacing(0, 2),
                    height: "100%",
                    position: "absolute",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    top: 0,
                    left: 0,
                  }}
                >
                  <SearchIcon />
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={() => setIsSearchOpen(false)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <IconButton color="inherit" onClick={() => setIsSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            )}
          </Box>

          {/* Notificaciones - solo si está autenticado */}
          {isAuthenticated && (
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <NotificationsIcon />
            </IconButton>
          )}

          {/* Perfil de usuario o botones de autenticación */}
          {isAuthenticated ? (
            <Box>
              <Button
                onClick={handleUserMenuOpen}
                color="inherit"
                endIcon={<ArrowDropDownIcon />}
                startIcon={
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                }
              >
                {!isMobile && user?.username}
              </Button>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={RouterLink} to="/profile" onClick={handleUserMenuClose}>
                  Mi Cuenta
                </MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button component={RouterLink} to="/login" variant="contained" color="primary" size="small">
              Iniciar Sesión
            </Button>
          )}

          {/* Botón de menú móvil */}
          {isMobile && (
            <IconButton edge="end" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} sx={{ ml: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para móvil */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              CinemaReserve
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            <ListItem button component={RouterLink} to="/cinema-rooms">
              <ListItemText primary="Películas" />
            </ListItem>
            {isAuthenticated && (
              <ListItem button component={RouterLink} to="/reservations">
                <ListItemText primary="Mis Reservas" />
              </ListItem>
            )}
            {!isAuthenticated && (
              <ListItem button component={RouterLink} to="/register">
                <ListItemText primary="Registrarse" />
              </ListItem>
            )}
          </List>
          {isAuthenticated && (
            <>
              <Divider />
              <List>
                <ListItem button component={RouterLink} to="/profile">
                  <ListItemText primary="Mi Cuenta" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemText primary="Cerrar Sesión" />
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </>
  )
}

export default Navbar
