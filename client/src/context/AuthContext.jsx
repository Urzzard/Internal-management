import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import loadingLogo from '../assets/logo.png'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const setAuthToken = (token) => {
        if(token){
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token)
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if(token){
                setAuthToken(token);
                try{
                    const response = await axios.get('http://localhost:8000/api/user/');
                    setUser(response.data);
                } catch (error){
                    console.error('Error verificacndo autorizacion: ', error);
                    logout()
                }
            }
            setLoading(false)
        }
        verifyAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username,
                password
            });
            
            const { access } = response.data;
            setAuthToken(access);

            const userResponse = await axios.get('http://localhost:8000/api/user/');
            setUser(userResponse.data);
            
            toast.success('Datos correctos, Ingresando...')
            setTimeout(() =>{
                navigate('/inicio');
            },700)
            
            return true;
            
        } catch (error) {
            console.error('Login error:', error.response || error);

            if(error.response){
                if(error.response.status === 401){
                    const detail = error.response.data?.detail;

                    if(detail && detail.includes("No active account found with the given credentials")){
                        toast.error('Tu cuenta está desactivada. Contacta al administrador.');
                    } else {
                        toast.error('Usuario o contraseña incorrecta')
                    }
                } else {
                    toast.error('Error al intentar iniciar sesion. Intenta de nuevo')
                }
            } else if(error.request) {
                toast.error('No se pudo conectar al servidor. Verifica tu conexion')
            } else {
                toast.error('Ocurrio un error inesperado.')
            }
            
            return false;
        }
        
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        toast.success("Sesion Cerrada")
        navigate('/login');
    };

    if(loading){
        return <div className='loading'>
                <img src={loadingLogo} alt="" />
                <p>
                Cargando...
                </p>
            </div>
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);