import { useState, useEffect } from "react";

export function CrudRegistroMat(){

    const [selected, setSelected] = useState(null)

    const handleSelectedClick = (cat) =>{
        setSelected(cat)
    }


    return(
        <div className={`inventario ${selected ? "modal-open": ""}`}>
            <div className="navegador">
                <a href="/inventario">
                    <h3>INVENTARIO</h3>
                </a>
                <div className="slash">
                    <h3>\</h3>
                </div>
                <a href="/crud-registro-mat">
                    <h3>REGISTROS</h3>
                </a>
                
            </div>
            <div className="c-principal">
                
            </div>
        </div>
    )
}