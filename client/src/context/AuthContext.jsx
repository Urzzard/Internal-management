import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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


    /* useEffect(() => {
        if(token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            verifyToken()
        }else{
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token])

    const verifyToken = async () => {
        try{
            const response = await axios.get('http://localhost:8000/api/user/');
            setUser(response.data)
        } catch(error){
            console.error('Token verificacion fallida:', error);
            logout();
        }
    } */

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
            console.error('Login error:', error);
            return false;
        }
        
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        navigate('/login');
    };

    if(loading){
        return <div>Cargando...</div>
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);