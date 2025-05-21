import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/api';

// Crear un archivo CSS básico para AdminCinemaRooms
const styles = {
  adminCinemaRooms: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  adminHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  createButton: {
    backgroundColor: '#e50914',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  noCinemas: {
    textAlign: 'center',
    padding: '50px 0',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  createLink: {
    color: '#e50914',
    textDecoration: 'underline',
    fontWeight: 'bold'
  },
  cinemaRoomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  cinemaRoomCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cinemaRoomHeader: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd'
  },
  cinemaRoomActions: {
    display: 'flex',
    gap: '10px'
  },
  editButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer'
  },
  cinemaRoomDetails: {
    padding: '15px'
  },
  adminLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px'
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTop: '4px solid #e50914',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  adminError: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '8px'
  },
  deleteModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  deleteModal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '100%'
  },
  warning: {
    color: '#dc3545',
    fontWeight: 'bold'
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 15px',
    cursor: 'pointer'
  },
  confirmButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 15px',
    cursor: 'pointer'
  }
};

const AdminCinemaRooms = () => {
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cinemaToDelete, setCinemaToDelete] = useState(null);
  const navigate = useNavigate();
  
  // Usar el hook de autenticación
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated() || (user && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    // Cargar salas de cine
    const fetchCinemaRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/cinemas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCinemaRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar salas de cine:', error);
        setError('Error al cargar las salas de cine. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchCinemaRooms();
  }, [navigate, isAuthenticated, user]);

  // Función para abrir el modal de confirmación de eliminación
  const handleDeleteClick = (cinema) => {
    setCinemaToDelete(cinema);
    setShowDeleteModal(true);
  };

  // Función para cerrar el modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCinemaToDelete(null);
  };

  // Función para eliminar una sala de cine
  const confirmDelete = async () => {
    if (!cinemaToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/cinemas/${cinemaToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Actualizar la lista de salas
      setCinemaRooms(cinemaRooms.filter(cinema => cinema.id !== cinemaToDelete.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error al eliminar sala de cine:', error);
      setError('Error al eliminar la sala de cine. Por favor, intenta de nuevo más tarde.');
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div style={styles.adminLoading}>
        <div style={styles.spinner}></div>
        <p>Cargando salas de cine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.adminError}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div style={styles.adminCinemaRooms}>
      <div style={styles.adminHeader}>
        <h1>Administrar Salas de Cine</h1>
        <Link to="/admin/cinemarooms/create" style={styles.createButton}>
          <i className="fas fa-plus"></i> Crear Nueva Sala
        </Link>
      </div>

      {cinemaRooms.length === 0 ? (
        <div style={styles.noCinemas}>
          <p>No hay salas de cine disponibles.</p>
          <Link to="/admin/cinemarooms/create" style={styles.createLink}>
            Crear una nueva sala
          </Link>
        </div>
      ) : (
        <div style={styles.cinemaRoomsGrid}>
          {cinemaRooms.map(cinema => (
            <div key={cinema.id} style={styles.cinemaRoomCard}>
              <div style={styles.cinemaRoomHeader}>
                <h2>{cinema.name}</h2>
                <div style={styles.cinemaRoomActions}>
                  <Link to={`/admin/cinemarooms/edit/${cinema.id}`} style={styles.editButton}>
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button 
                    style={styles.deleteButton}
                    onClick={() => handleDeleteClick(cinema)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div style={styles.cinemaRoomDetails}>
                <p><strong>Película:</strong> {cinema.movie_title || 'No asignada'}</p>
                <p><strong>Capacidad:</strong> {cinema.rows * cinema.columns} asientos</p>
                <p><strong>Distribución:</strong> {cinema.rows} filas x {cinema.columns} columnas</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div style={styles.deleteModalOverlay}>
          <div style={styles.deleteModal}>
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar la sala <strong>{cinemaToDelete?.name}</strong>?</p>
            <p style={styles.warning}>Esta acción no se puede deshacer y eliminará todas las reservaciones asociadas.</p>
            <div style={styles.modalButtons}>
              <button style={styles.cancelButton} onClick={closeDeleteModal}>Cancelar</button>
              <button style={styles.confirmButton} onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCinemaRooms;