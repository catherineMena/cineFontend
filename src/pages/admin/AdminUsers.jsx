import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/api';

// Crear un archivo CSS básico para AdminUsers
const styles = {
  adminUsers: {
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
  searchContainer: {
    position: 'relative',
    width: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 35px 10px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  searchIcon: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6c757d'
  },
  noUsers: {
    textAlign: 'center',
    padding: '50px 0',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  usersTableContainer: {
    overflowX: 'auto'
  },
  usersTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  },
  roleBadge: {
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textAlign: 'center',
    display: 'inline-block'
  },
  admin: {
    backgroundColor: '#dc3545',
    color: 'white'
  },
  user: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  actionsCell: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  roleButton: {
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
  modalOverlay: {
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
  modal: {
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

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();
  
  // Usar el hook de autenticación
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated() || (user && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    // Cargar usuarios
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar los usuarios. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, isAuthenticated, user]);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Función para abrir el modal de confirmación de eliminación
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Función para cerrar el modal de eliminación
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Función para abrir el modal de cambio de rol
  const handleRoleClick = (user) => {
    setUserToChangeRole(user);
    setShowRoleModal(true);
  };

  // Función para cerrar el modal de cambio de rol
  const closeRoleModal = () => {
    setShowRoleModal(false);
    setUserToChangeRole(null);
  };

  // Función para eliminar un usuario
  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Actualizar la lista de usuarios
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setFilteredUsers(filteredUsers.filter(u => u.id !== userToDelete.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar el usuario. Por favor, intenta de nuevo más tarde.');
      closeDeleteModal();
    }
  };

  // Función para cambiar el rol de un usuario
  const confirmRoleChange = async () => {
    if (!userToChangeRole) return;

    try {
      const token = localStorage.getItem('token');
      const newRole = userToChangeRole.role === 'admin' ? 'user' : 'admin';
      
      await axios.put(`${API_URL}/users/${userToChangeRole.id}/role`, { role: newRole }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Actualizar la lista de usuarios
      const updatedUsers = users.map(u => {
        if (u.id === userToChangeRole.id) {
          return { ...u, role: newRole };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      closeRoleModal();
    } catch (error) {
      console.error('Error al cambiar rol de usuario:', error);
      setError('Error al cambiar el rol del usuario. Por favor, intenta de nuevo más tarde.');
      closeRoleModal();
    }
  };

  if (loading) {
    return (
      <div style={styles.adminLoading}>
        <div style={styles.spinner}></div>
        <p>Cargando usuarios...</p>
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
    <div style={styles.adminUsers}>
      <div style={styles.adminHeader}>
        <h1>Administrar Usuarios</h1>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <i className="fas fa-search" style={styles.searchIcon}></i>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={styles.noUsers}>
          <p>No se encontraron usuarios.</p>
        </div>
      ) : (
        <div style={styles.usersTableContainer}>
          <table style={styles.usersTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{...styles.roleBadge, ...(u.role === 'admin' ? styles.admin : styles.user)}}>
                      {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={styles.actionsCell}>
                    <button 
                      style={styles.roleButton}
                      onClick={() => handleRoleClick(u)}
                      disabled={u.id === user?.id} // No permitir cambiar el propio rol
                    >
                      <i className="fas fa-user-cog"></i>
                    </button>
                    <button 
                      style={styles.deleteButton}
                      onClick={() => handleDeleteClick(u)}
                      disabled={u.id === user?.id} // No permitir eliminar el propio usuario
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.username}</strong>?</p>
            <p style={styles.warning}>Esta acción no se puede deshacer y eliminará todas las reservaciones asociadas.</p>
            <div style={styles.modalButtons}>
              <button style={styles.cancelButton} onClick={closeDeleteModal}>Cancelar</button>
              <button style={styles.confirmButton} onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de rol */}
      {showRoleModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Cambiar Rol de Usuario</h2>
            <p>¿Estás seguro de que deseas cambiar el rol de <strong>{userToChangeRole?.username}</strong> de <strong>{userToChangeRole?.role === 'admin' ? 'Administrador' : 'Usuario'}</strong> a <strong>{userToChangeRole?.role === 'admin' ? 'Usuario' : 'Administrador'}</strong>?</p>
            <div style={styles.modalButtons}>
              <button style={styles.cancelButton} onClick={closeRoleModal}>Cancelar</button>
              <button style={styles.confirmButton} onClick={confirmRoleChange}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;