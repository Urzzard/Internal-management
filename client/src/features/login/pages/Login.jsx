import React, {useState, useEffect} from "react"
import { toast } from "react-hot-toast";
import logo from '../../../assets/LOGO.png'
import axios from 'axios'
import './Login.css'
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";


export function Login(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError('');
        
        const success = await login(username, password);
        if(!success){
            setError('Credenciales incorrectas')
        }


        /* try {
            const res = await axios.post('http://localhost:8000/api/token/', {
                username: username,
                password: password
            })

            localStorage.setItem('accesToken', res.data.access);
            localStorage.setItem('refreshToken', res.data.refresh);
            localStorage.setItem('username', username)

            

            

            toast.success('Credenciales Verificados!!')
            setTimeout(() =>{
                window.location.href = '/inicio';
            }, 800)
            
        } catch(err){
            toast.error('Usuario o Contraseña Incorrectos!!')
            setTimeout(() =>{
                window.location;
            }, 700)
            setError('Usuario o Contraseña incorrectos')
        } */
    }

    return(
        <div className="login">
            <div className="contenedor">
                
                <div className="title">
                    <img src={logo}/>
                    <h3>LOGIN</h3>
                </div>
    
                <form onSubmit={handleSubmit}>
                    <div className="form-log">
                        <div className="f-label">
                            <label htmlFor="username" className="l-u">Nombre de Usuario: </label>
                            <label htmlFor="password" className="l-p">Contraseña: </label>
                        </div>
        
                        <div className="f-input">
                            <input type="text" name="username" id="username" className="i-u" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                            <input type="password" name="password" id="password" className="i-p" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                        </div>
                    </div>

                    {error && (
                        <div className="alerta" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <div className="alerta-negativa" style={{ width: '55%', padding: '10px', textAlign: 'center', background: 'red', color: '#f0f9ee', borderRadius: '10px', marginBottom: '10px' }}>
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="btn-log">
                        <button type="submit" className="hover:bg-teal-400">Iniciar Sesion</button>
                    </div>
                    
                </form>
            </div>
        </div>
    )
}