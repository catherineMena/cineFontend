"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { cinemaService } from "../../api/api"
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
} from "@mui/material"
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cinema-tabpanel-${index}`}
      aria-labelledby={`cinema-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const AdminEditCinemaRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'capacity' ? 1 : 0;
  
  const [tabValue, setTabValue] = useState(initialTab);
  const [name, setName] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [rows, setRows] = useState('');
  const [columns, setColumns] = useState('');
  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [currentPoster, setCurrentPoster] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [movieTitleError, setMovieTitleError] = useState<string | null>(null);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [columnsError, setColumnsError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [hasReservations, setHasReservations] = useState(false);

  // Cargar datos de la sala
  useEffect(() => {
    const fetchCinemaRoom = async () => {
      try {
        if (!id) return;
        
        const data = await cinemaService.getCinemaById(id);
        
        setName(data.name);
        setMovieTitle(data.movie_title);
        setRows(data.rows.toString());
        setColumns(data.columns.toString());
        setCurrentPoster(data.movie_poster);
        
        // Verificar si hay reservaciones (si hay asientos reservados en alguna fecha)
        const hasAnyReservations = Object.values(data.reservedSeatsMap).some(
          (seats) => seats.length > 0
        );
        setHasReservations(hasAnyReservations);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar los datos de la sala');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCinemaRoom();
  }, [id]);

  // Manejar cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manejar cambio de archivo de póster
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tipo de archivo
      if (!file.type.includes('image/')) {
        setError('El archivo debe ser una imagen');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      
      setPoster(file);
      setPosterPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Validar formulario de película
  const validateMovieForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('El nombre de la sala es obligatorio');
      isValid = false;
    } else {
      setNameError(null);
    }
    
    if (!movieTitle.trim()) {
      setMovieTitleError('El título de la película es obligatorio');
      isValid = false;
    } else {
      setMovieTitleError(null);
    }
    
    return isValid;
  };

  // Validar formulario de capacidad
  const validateCapacityForm = () => {
    let isValid = true;
    
    if (!rows) {
      setRowsError('El número de filas es obligatorio');
      isValid = false;
    } else if (Number.parseInt(rows) <= 0 || Number.parseInt(rows) > 20) {
      setRowsError('El número de filas debe estar entre 1 y 20');
      isValid = false;
    } else {
      setRowsError(null);
    }
    
    if (!columns) {
      setColumnsError('El número de columnas es obligatorio');
      isValid = false;
    } else if (Number.parseInt(columns) <= 0 || Number.parseInt(columns) > 20) {
      setColumnsError('El número de columnas debe estar entre 1 y 20');
      isValid = false;
    } else {
      setColumnsError(null);
    }
    
    return isValid;
  };

  // Actualizar película
  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMovieForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (!id) return;
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('movieTitle', movieTitle);
      if (poster) {
        formData.append('poster', poster);
      }
      
      await cinemaService.updateCinemaMovie(id, formData);
      navigate('/admin/cinemas');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la película');
    } finally {
      setSaving(false);
    }
  };

  // Actualizar capacidad
  const handleUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCapacityForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    setCapacityError(null);
    
    try {
      if (!id) return;
      
      await cinemaService.updateCinemaCapacity(id, Number.parseInt(rows), Number.parseInt(columns));
      navigate('/admin/cinemas');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setCapacityError('No se puede modificar la capacidad porque la sala tiene reservaciones');
      } else {
        setError(err.response?.data?.message || 'Error al actualizar la capacidad');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editar Sala de Cine
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="cinema room tabs">
            <Tab label="Información de Película" />
            <Tab label="Capacidad de Sala" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleUpdateMovie}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información de la Sala y Película
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                >
                  Cambiar Póster
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePosterChange}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Deja vacío para mantener el póster actual
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {posterPreview ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      backgroundImage: `url(${posterPreview})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                    }}
                  />
                ) : currentPoster && (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      backgroundImage: `url(${currentPoster.startsWith('/uploads') 
                        ? `http://localhost:3000${currentP
