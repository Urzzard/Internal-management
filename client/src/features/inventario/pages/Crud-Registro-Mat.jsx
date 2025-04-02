import { useState, useEffect } from "react";
import { BaseLayout } from "../../../components/layout/BaseLayout";

export function CrudRegistroMat(){

    const [selected, setSelected] = useState(null)

    const handleSelectedClick = (cat) =>{
        setSelected(cat)
    }


    return(
        <div className={`inventario ${selected ? "modal-open": ""}`}>
            
            <BaseLayout breadcrumbs={[
                {label: 'INICIO', path: '/inicio'},
                {label: 'INVENTARIO', path: '/inventario'},
                {label: 'CRUD REGISTRO MATERIALES', path: '/crud-registro-mat'},
            ]}>

            </BaseLayout>
        </div>
    )
}