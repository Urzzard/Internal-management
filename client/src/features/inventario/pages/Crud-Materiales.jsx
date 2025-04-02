import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form'
import { getAllM, createM, deleteM, updateM, importM } from "../api/crud-material.api"
import { getAllMCats } from "../api/crud-categoria.api"
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BaseLayout } from "../../../components/layout/BaseLayout";

export function CrudMaterial(){
    //PARA CARGAR LOS DATOS DE LA API

    const [m, setM] = useState([]);

    useEffect(() =>{
        async function loadM() {
            const res = await getAllM();
            setM(res.data);
        }
        loadM();
    }, [])

    const [cat, setCat] = useState([]);

    useEffect(() =>{
        async function loadCat() {
            const res2 = await getAllMCats();
            setCat(res2.data);
        }loadCat();
    }, [])


    //PARA CREAR O REGISTRAR DATOS EN LA API

    const {
        register, 
        handleSubmit, 
        formState:{errors},
    } = useForm()

    const navigate = useNavigate()

    const onSubmit = handleSubmit(async (data2) => {
        await createM(data2)
        toast.success('Material Creado')
        setTimeout(() =>{
            navigate(0)
        }, 800)
    })

    //PARA EDITAR - ABRIR MODAL

    const [selected, setSelected] = useState(null)

    const handleSelectedClick = (m) =>{
        setSelected(m)
    }


    //IMPORTAR

    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleImport = async () =>{
        if (file){
            const formData = new FormData();
            formData.append('file', file)

            try{
                await importM(formData)
                toast.success('Materiales importados con Exito')
                setTimeout(() =>{
                    navigate(0);
                }, 800)
            } catch (error){
                toast.error('Error al importar materiales')
            }
        }
    }


    //EXTRAS SLIDE DE REGISTRO O IMPORT

    const [visible, setVisible] = useState(false)
    const [visibleI, setVisibleI] = useState(false)

    const slide = () => {
        setVisible(!visible);
        if(visibleI){
            setVisibleI(!visibleI)
        }
    }

    const slideI = () => {
        setVisibleI(!visibleI);
        if(visible){
            setVisible(!visible)
        }
    }


    // ORDEN Y FILTRO

    const [sortColumn, setSortColumn] = useState('');
    const [sortDir, setSortDir] = useState('asc');

    const handleSort = (column) => {
        if (sortColumn === column){
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')

        } else{
            setSortColumn(column)
            setSortDir('asc')
        }
    }


    const sortedM = [...m].sort((a,b) => {
        if(sortColumn){
            const aValue = a[sortColumn]
            const bValue = b[sortColumn]

            if(aValue < bValue) return sortDir === 'asc' ? -1 : 1;
            if(aValue > bValue) return sortDir === 'asc' ? 1 : -1;

            return 0;
        }
        return 0;
    })
        


    return(
        <div className={`inventario ${selected ? "modal-open": ""}`}>
            <BaseLayout breadcrumbs={[
                {label: 'INICIO', path: '/inicio'},
                {label: 'INVENTARIO', path: '/inventario'},
                {label: 'CRUD MATERIALES', path: '/crud-materiales'},
            ]}>
            
                <div className="crear">
                    <h2 onClick={slide} style={{cursor:'pointer'}}>REGISTRAR NUEVO MATERIAL</h2>
                {(visible &&
                    <form onSubmit={onSubmit}>
                        <div className="f1">
                            <div className="rm-codigo">
                                <label htmlFor="codigo">Codigo:</label>
                                <input type="text" name="codigo" className="form-control" id="codigo"
                                    {...register("codigo", {required: true})}
                                />
                                {errors.codigo && <span className="validacion1" >Este campo es requerido!!</span>}
                            </div> 
                            <div className="rm-nombre">
                                <label htmlFor="nombre">Nombre:</label>
                                <input type="text" name="nombre" className="form-control" id="nombre"
                                    {...register("nombre", {required: true})}
                                />
                                {errors.nombre && <span className="validacion1" >Este campo es requerido!!</span>}
                            </div>   
                        </div>
                        <div className="f2">
                            <div className="rm-categoria">
                                <label htmlFor="categoria">Categoria:</label>
                                <select name="categoria" id="categoria" className="form-control"
                                    {...register("categoria", {required: true})}>
                                    {cat.map(m =>(
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                                {errors.categoria && <span className="validacion1" >Este campo es requerido!!</span>}
                            </div>
                            <div className="rm-umedida">
                                <label htmlFor="umedida">Unidad de Medida:</label>
                                <input type="text" name="umedida" className="form-control" id="umedida"
                                    {...register("umedida", {required: true})}
                                />
                                {errors.umedida && <span className="validacion1" >Este campo es requerido!!</span>}
                            </div>
                            <div className="rm-cantidad">
                                <label htmlFor="cantidad">Cantidad:</label>
                                <input type="number" name="cantidad" className="form-control" id="cantidad"
                                    {...register("cantidad", {required: true})}
                                />
                                {errors.cantidad && <span className="validacion1" >Este campo es requerido!!</span>}
                            </div>
                        </div>
                        <div className="btn-guardar ">
                            <button className="hover:bg-teal-500">Guardar</button>
                        </div>
                    </form>
                )}
                </div>
                <div className="importar">
                    <h2 onClick={slideI} style={{cursor:'pointer'}}>IMPORTAR MATERIALES DESDE EXCEL</h2>
                    {visibleI && (
                        <div className="form-importar">
                            <label htmlFor="importar" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccionar archivo</label>
                            <input type="file" id="importar"  onChange={handleFileChange}/>
                            <div className="btn-guardar">
                                <button onClick={handleImport} className="hover:bg-teal-500">Importar</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mostrar">
                    <h2> LISTA Y STOCK DE MATERIALES EN OBRA </h2>
                    <table className="min-w-ful ">
                        <thead>
                            <tr >
                                <th className="m-id" onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th className="m-codigo" onClick={() => handleSort('codigo')}>CODIGO {sortColumn === 'codigo' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th className="m-nombre" onClick={() => handleSort('nombre')}>NOMBRE {sortColumn === 'nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th className="m-categoria" onClick={() => handleSort('categoria')}>CATEGORIA {sortColumn === 'categoria' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th className="m-umedida" onClick={() => handleSort('umedida')}>U. DE MEDIDA {sortColumn === 'umedida' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th className="m-cantidad" onClick={() => handleSort('cantidad')}>CANTIDAD {sortColumn === 'cantidad' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th className="m-opciones">OPCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedM.map(m => {
                                const categoria = cat.find(c =>c.id === m.categoria);
                                return(
                                <tr key={m.id} className="border-b border-gray-500 hover:bg-emerald-100">
                                    <td>{m.id}</td>
                                    <td>{m.codigo}</td>
                                    <td>{m.nombre}</td>
                                    <td>{categoria ? categoria.nombre : 'categoria no encontrada'}</td>
                                    <td>{m.umedida}</td>
                                    <td>{m.cantidad}</td>
                                    <td className="m-btn">
                                        <div className="edit">
                                            <button className="edit-btn hover:bg-teal-500" onClick={() => handleSelectedClick(m)} key={m.id}>EDITAR</button> 
                                        </div>
                                        <div className="delete">
                                            <button onClick={async() => {
                                                const accepted = window.confirm('Estas seguro de eliminar este Material?')
                                                if(accepted){
                                                    await deleteM(m.id)
                                                    toast.success('Material Eliminado');
                                                    setTimeout(() =>{
                                                        navigate(0)
                                                    }, 500)
                                                }
                                            }} id="eliminarmat" name="eliminarmat" value="" className="delete-btn hover:bg-red-400">ELIMINAR</button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            
                        </tbody>
                        
                    </table>
                    
                </div>
            </BaseLayout>
            {selected &&(
                <EditarMat mat={selected} onClose={() =>setSelected(null)} categorias={cat} />
            )}
        </div>
    )
}

function EditarMat({mat, onClose, categorias}){

    const [formValues, setFormValues] = useState({
        codigo: mat.codigo,
        nombre: mat.nombre,
        categoria: mat.categoria,
        umedida: mat.umedida,
        cantidad: mat.cantidad
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormValues({
            ...formValues,
            [name]:value
        })
    }

    const handleSubmit2 = async () => {
        await updateM(mat.id, formValues);
        onClose();
        toast.success('Editado con exito')
        setTimeout(() =>{
            window.location.reload();
        }, 700)
    }

    return(
        <div className="modal">
            <div className="detalle-cat">
                <h2>EDITAR CATEGORIA</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="em-codigo">
                        <label htmlFor="codigo">Codigo:</label><br/>
                        <input type="text" name="codigo" className="form-control" id="codigo" value={formValues.codigo} onChange={handleInputChange}/>
                    </div> 
                    <div className="em-nombre">
                        <label htmlFor="nombre">Nombre:</label><br/>
                        <input type="text" name="nombre" className="form-control" id="nombre" value={formValues.nombre} onChange={handleInputChange}/>
                    </div> 
                    <div className="em-categoria">
                        <label htmlFor="categoria">Categoria:</label><br/>
                        <select name="categoria" id="categoria" className="form-control" value={formValues.categoria} onChange={handleInputChange}>
                            {categorias.map((c) =>(
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="em-umedida">
                        <label htmlFor="umedida">U. de medida:</label><br/>
                        <input type="text" name="umedida" className="form-control" id="umedida" value={formValues.umedida} onChange={handleInputChange}/>
                    </div> 
                    <div className="em-cantidad">
                        <label htmlFor="cantidad">Cantidad:</label><br/>
                        <input type="text" name="cantidad" className="form-control" id="cantidad" value={formValues.cantidad} onChange={handleInputChange}/>
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