import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api.js';

// Crear el contexto
export const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verificar el token con el backend
          try {
            const response = await axios.post(
              `${API_URL}/auth/verify-token`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            if (response.data.success) {
              setUser(response.data.user);
              setError(null);
            } else {
              // Token inválido, limpiar localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            console.error('Error al verificar token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Función de inicio de sesión
  const login = async (username, password) => {
    try {
      setError(null);
      console.log('Intentando iniciar sesión con:', { username, password });
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        
        // Redirigir según el rol
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/cinemarooms');
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data) {
        // Redirigir a login después de registro exitoso
        navigate('/login');
        return true;
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setError(error.response?.data?.message || 'Error al registrar usuario');
      return false;
    }
  };

  // Función de cierre de sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;