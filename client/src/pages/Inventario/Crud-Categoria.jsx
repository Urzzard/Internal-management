import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form'
import { getAllMCats, createMCats, deleteMCats, updateMCats } from "../../api/api-inventario/crud-categoria.api"
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function CrudCategoria(){
    //PARA CARGAR LOS DATOS DE LA API
    const [mcat, setMcat] = useState([]);

    useEffect(() =>{
        async function loadMCat() {
            const res = await getAllMCats();
            setMcat(res.data);
        }
        loadMCat();
    }, [])

    //PARA CREAR O REGISTRAR DATOS EN LA API

    const {
        register, 
        handleSubmit, 
        formState:{errors},
    } = useForm()

    const navigate = useNavigate()

    const onSubmit = handleSubmit(async (data2) => {
        await createMCats(data2)
        toast.success('Categoria Creada')
        setTimeout(() =>{
            navigate(0)
        }, 800)
    })

    //PARA EDITAR - ABRIR MODAL

    const [selected, setSelected] = useState(null)

    const handleSelectedClick = (cat) =>{
        setSelected(cat)
    }

    //PARA HACER VISIBLE EL FORMULARIO

    const [visible, setVisible] = useState(false)

    const slide = () => {
        setVisible(!visible);
        console.log('click')
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
                <a href="/crud-categoria">
                    <h3>CRUD - CATEGORIA DE MATERIALES</h3>
                </a>
                
            </div>
            <div className="c-principal">
                <div className="crear">
                    <h2 onClick={slide} style={{cursor:'pointer'}}>REGISTRAR NUEVA CATEGORIA DE MATERIAL</h2>
                    {(visible &&
                        <form onSubmit={onSubmit}>
                            <div className="f1">
                                <div className="cm-nombre">
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" name="nombre" className="form-control" id="nombre"
                                        {...register("nombre", {required: true})}
                                    />
                                    {errors.nombre && <span className="validacion1" >Este campo es requerido!!</span>}
                                </div>   
                            </div>
                            <div className="btn-guardar ">
                                <button className="hover:bg-teal-500">Guardar</button>
                            </div>
                        </form>
                    )}
                    

                </div>
                <div className="mostrar">
                    <h2> LISTA DE CATEGORIA DE MATERIALES </h2>
                    <table className="min-w-ful ">
                        <thead>
                            <tr >
                                <th className="cm-id">ID</th>
                                <th className="cm-nombre">NOMBRE</th>
                                <th className="cm-opciones">OPCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mcat.map(mcat => (
                                <tr key={mcat.id} className="border-b border-gray-500 hover:bg-emerald-100">
                                    <td>{mcat.id}</td>
                                    <td>{mcat.nombre}</td>
                                    <td className="m-btn">
                                        <div className="edit">
                                            <button className="edit-btn hover:bg-teal-500" onClick={() => handleSelectedClick(mcat)} key={mcat.id}>EDITAR</button> 
                                        </div>
                                        <div className="delete">
                                            <button onClick={async() => {
                                                const accepted = window.confirm('Estas seguro de eliminar esta categoria?')
                                                if(accepted){
                                                    await deleteMCats(mcat.id)
                                                    toast.success('Categoria Eliminada');
                                                    setTimeout(() =>{
                                                        navigate(0)
                                                    }, 500)
                                                }
                                            }} id="eliminarcat" name="eliminarcat" value="" className="delete-btn hover:bg-red-400">ELIMINAR</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>
                        
                    </table>
                    
                </div>
            </div>
            {selected &&(
                <EditarCat cat={selected} onClose={() =>setSelected(null)} />
            )}
        </div>
    )
}

function EditarCat({cat, onClose}){

    const [formValues, setFormValues] = useState({
        nombre: cat.nombre
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormValues({
            ...formValues,
            [name]:value
        })
    }

    const handleSubmit2 = async () => {
        await updateMCats(cat.id, formValues);
        onClose();
        toast.success('Categoria Actualizada')
        setTimeout(() =>{
            window.location.reload();
        }, 700)
        
    }

    return(
        <div className="modal">
            <div className="detalle-cat">
                <h2>EDITAR CATEGORIA</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="em-nombre">
                        <label htmlFor="nombre">Nombre:</label><br/>
                        <input type="text" name="nombre" className="form-control" id="nombre" value={formValues.nombre} onChange={handleInputChange}/>
                    </div> 
                    <div className="em-btn">
                        <button className="edit-btn hover:bg-teal-500" type="button" onClick={handleSubmit2}>GUARDAR CAMBIOS</button>
                        <button className="cerrar-btn hover:bg-gray-300" onClick={onClose}>CERRAR</button> 
                    </div>
                </form>
            </div>
        </div>
    )
}