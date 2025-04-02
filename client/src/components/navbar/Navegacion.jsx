import React, {useState, useEffect} from "react"
import logo2 from '../../assets/VIA-VERDE-LOGO.jpeg'
import perfil from '../../assets/icons/perfil-90.png'
import './Navegacion.css'

export function Navegacion(){

    const [username, setUser] = useState('')

    useEffect(() => {
        const su = localStorage.getItem('username');

        if(su){
            setUser(su)
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('username')
        window.location.href = '/login';
    }

    return(
        <div className="navegacion">
            <div className="logo">
                <a href="/inicio"><img src={logo2} alt=""/></a>
            </div>
            <nav className="menu-nav">
                <ul>
                    <li>
                        <a href="/inicio">INICIO</a>
                    </li>
                    <li>
                        <a href="/personal">PERSONAL</a>
                    </li>
                    <li>
                        <a href="/inventario">INVENTARIO</a>
                    </li>
                    
                </ul>
            </nav>
            <div className="i-perfil">
                <div className="i-usuario">
                    <div className="nav-perfil">
                        <img width="50" height="50" src={perfil} alt="test-account"/>
                    </div>
                    <div id="submenu">
                        <ul>
                            <li className="nav-user"><a href="#">{username}</a></li>
                            <li className="logout"><a href="#" onClick={handleLogout}>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}