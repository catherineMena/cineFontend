import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    primary: {
      main: "#e91e63", // Rosa para el tema de cine
      light: "#ff6090",
      dark: "#b0003a",
      contrastText: "#fff",
    },
    secondary: {
      main: "#2196f3", // Azul
      light: "#6ec6ff",
      dark: "#0069c0",
      contrastText: "#fff",
    },
    background: {
      default: "#f5f5f5",
      paper: "#fff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)",
        },
      },
    },
  },
})

export default theme