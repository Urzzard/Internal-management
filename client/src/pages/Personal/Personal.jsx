import addpersonal from '../../assets/personal/agregar-usuario.png'
import './Personal.css'

export function Personal(){
    return(
        <div className="personal">
            <div className="navegador">
                <a href="/personal">
                    <h3>PERSONAL</h3>
                </a>
            </div>
            <div className="c-principal">
                <div className="o1">
                    <a href="/crud-personal" className="i1">
                        <img src={addpersonal} alt=""/>
                        <h3>CRUD PERSONAL</h3>
                    </a>
                </div>
            </div>
        </div>
    )
}