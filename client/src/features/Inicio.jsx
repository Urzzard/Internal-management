import { useState } from "react"
import { useAuth } from "../context/AuthContext"
export function Inicio(){

    const {user} = useAuth();

    return(
        <div className="inicio">
            <h3>Bienvenido, {user.username} {user.is_superuser ? '(Admin)': user.is_staff ? '(Staff)': ''}</h3>
        </div>
    )
}