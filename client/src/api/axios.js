// Crea un archivo src/api/axios.js
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const { logout } = useAuth();
            logout();
        }
        return Promise.reject(error);
    }
);

export default api;