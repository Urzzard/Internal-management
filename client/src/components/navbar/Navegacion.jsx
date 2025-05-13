import logo2 from '../../assets/VIA-VERDE-LOGO.jpeg'
import perfil from '../../assets/icons/perfil-90.png'
import { useAuth } from "../../context/AuthContext"
import './Navegacion.css'

export function Navegacion(){

    const {user, logout} = useAuth();


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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </div>
                    <div id="submenu">
                        {user && (
                            <ul>
                                <li className="nav-user"><a href="#">{user.username}</a></li>
                                <li className="logout"><a href="#" onClick={logout}>Logout</a></li>
                            </ul>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}