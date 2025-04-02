import React, {useState, useEffect} from "react"
import { toast } from "react-hot-toast";
import logo from '../../../assets/LOGO.png'
import axios from 'axios'
import './Login.css'

export function Login(){

    const [username, setUser] = useState('');
    const [password, setPass] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) =>{
        e.preventDefault();

        try {
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
        }
    }

    return(
        <div className="login">
            <div className="contenedor">
                
                <div className="title">
                    <img src={logo}/>
                    <h3>LOGIN</h3>
                </div>
    
                <form onSubmit={handleLogin}>
                    <div className="form-log">
                        <div className="f-label">
                            <label htmlFor="username" className="l-u">Nombre de Usuario: </label>
                            <label htmlFor="password" className="l-p">Contraseña: </label>
                        </div>
        
                        <div className="f-input">
                            <input type="text" name="user" id="username" className="i-u" value={username} onChange={(e) => setUser(e.target.value)}/>
                            <input type="password" name="pass" id="password" className="i-p" value={password} onChange={(e) => setPass(e.target.value)}/>
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