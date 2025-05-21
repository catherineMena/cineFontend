import { Link as RouterLink } from "react-router-dom"
import { Box, Button, Typography, Container } from "@mui/material"
import { SentimentDissatisfied as SentimentDissatisfiedIcon } from "@mui/icons-material"

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: "primary.main", mb: 2 }} />
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Página no encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large" sx={{ mt: 2 }}>
          Volver al Inicio
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound
