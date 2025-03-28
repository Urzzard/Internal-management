import crudinventario from '../../assets/inventario/agregar-producto.png'
import crudcategoria from '../../assets/inventario/categorias.png'
import entradasalida from '../../assets/inventario/registro-inventario.png'
import './Inventario.css'

export function Inventario(){
    return(
        <div className="inventario">
            <div className="navegador">
                <a href="/inventario">
                    <h3>INVENTARIO</h3>
                </a>
            </div>
            <div className="c-principal">
                <div className="o1">
                    <a href="/crud-categoria" className="i1">
                        <img src={crudcategoria} alt=""/>
                        <h3>CRUD CATEGORIAS DE MATERIALES</h3>
                    </a>
                    <a href="/crud-material" className="i1">
                        <img src={crudinventario} alt=""/>
                        <h3>CRUD MATERIALES</h3>
                    </a>
                    <a href="/crud-registro-mat" className="i1">
                        <img src={entradasalida} alt=""/>
                        <h3>REGISTRO DE INGRESOS Y SALIDAS</h3>
                    </a>
                </div>
            </div>
        </div>
    )
}