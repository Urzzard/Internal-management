import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import styles from './Inicio.module.css'
export function Inicio(){

    const {user} = useAuth();

    return(
        <div className={styles.contenedor}>
            <h3>Bienvenido, {user.username} {user.is_superuser ? '(Admin)': user.is_staff ? '(Staff)': ''}</h3>
            <div className={styles.stats}>
                <div className={styles.statsPersonal}>
                    
                </div>
            </div>
        </div>
    )
}