import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
    baseURL: 'http://localhost:8000',
});

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