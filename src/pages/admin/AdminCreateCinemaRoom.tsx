"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cinemaService } from "../../api/api"
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
} from "@mui/material"
import { CloudUpload as CloudUploadIcon, Save as SaveIcon } from "@mui/icons-material"

const AdminCreateCinemaRoom = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [movieTitle, setMovieTitle] = useState("")
  const [rows, setRows] = useState("")
  const [columns, setColumns] = useState("")
  const [poster, setPoster] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [movieTitleError, setMovieTitleError] = useState<string | null>(null)
  const [rowsError, setRowsError] = useState<string | null>(null)
  const [columnsError, setColumnsError] = useState<string | null>(null)
  const [posterError, setPosterError] = useState<string | null>(null)

  // Manejar cambio de archivo de póster
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validar tipo de archivo
      if (!file.type.includes("image/")) {
        setPosterError("El archivo debe ser una imagen")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setPosterError("La imagen no debe superar los 5MB")
        return
      }

      setPoster(file)
      setPosterPreview(URL.createObjectURL(file))
      setPosterError(null)
    }
  }

  // Validar formulario
  const validateForm = () => {
    let isValid = true

    if (!name.trim()) {
      setNameError("El nombre de la sala es obligatorio")
      isValid = false
    } else {
      setNameError(null)
    }

    if (!movieTitle.trim()) {
      setMovieTitleError("El título de la película es obligatorio")
      isValid = false
    } else {
      setMovieTitleError(null)
    }

    if (!rows) {
      setRowsError("El número de filas es obligatorio")
      isValid = false
    } else if (Number.parseInt(rows) <= 0 || Number.parseInt(rows) > 20) {
      setRowsError("El número de filas debe estar entre 1 y 20")
      isValid = false
    } else {
      setRowsError(null)
    }

    if (!columns) {
      setColumnsError("El número de columnas es obligatorio")
      isValid = false
    } else if (Number.parseInt(columns) <= 0 || Number.parseInt(columns) > 20) {
      setColumnsError("El número de columnas debe estar entre 1 y 20")
      isValid = false
    } else {
      setColumnsError(null)
    }

    if (!poster) {
      setPosterError("El póster de la película es obligatorio")
      isValid = false
    } else {
      setPosterError(null)
    }

    return isValid
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("movieTitle", movieTitle)
      formData.append("rows", rows)
      formData.append("columns", columns)
      if (poster) {
        formData.append("poster", poster)
      }

      await cinemaService.createCinema(formData)
      navigate("/admin/cinemas")
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear la sala de cine")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Crear Nueva Sala de Cine
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información de la Sala
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Nombre de la Sala"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!nameError}
                  helperText={nameError}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Título de la Película"
                  fullWidth
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  error={!!movieTitleError}
                  helperText={movieTitleError}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Capacidad de la Sala
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Número de Filas"
                  fullWidth
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  error={!!rowsError}
                  helperText={rowsError}
                  disabled={loading}
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Número de Columnas"
                  fullWidth
                  type="number"
                  value={columns}
                  onChange={(e) => setColumns(e.target.value)}
                  error={!!columnsError}
                  helperText={columnsError}
                  disabled={loading}
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Póster de la Película
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={loading}
                >
                  Subir Póster
                  <input type="file" accept="image/*" hidden onChange={handlePosterChange} />
                </Button>
                {posterError && <FormHelperText error>{posterError}</FormHelperText>}
              </Grid>

              <Grid item xs={12} md={6}>
                {posterPreview && (
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      backgroundImage: `url(${posterPreview})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button variant="outlined" onClick={() => navigate("/admin/cinemas")} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar Sala"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AdminCreateCinemaRoom
