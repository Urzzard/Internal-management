import styles from './CrudGremio.module.css';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createGremio, deleteGremio, getAllGremio, updateGremio } from '../../../api/crud-gremio.api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export function CrudGremio(){
    const navigate = useNavigate()
    const [gremio, setGremio] = useState([])

    useEffect(() => {
        async function loadGremio() {
            const res = await getAllGremio();
            setGremio(res.data);
        }
        loadGremio();
    }, [])

    const {
        register,
        handleSubmit,
        formState:{errors},
    } = useForm()

    const onSubmit = handleSubmit(async (data) => {
        try{
            await createGremio(data)
            toast.success('Gremio creado')
            setTimeout(() => {
                navigate(0)
            }, 800)
        }catch(error){
            toast.error("Error al registrar gremio")
            console.log(error)
        }
    })

    const [selected, setSelected] = useState(null);

    const handleSelectedClick = gremio => {
        setSelected(gremio)
    }

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


    const sortedGremio = [...gremio].sort((a,b) => {
        if(sortColumn){
    
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            const numA = parseFloat(aValue);
            const numB = parseFloat(bValue);
            const isNumeric = !isNaN(numA) && !isNaN(numB)

            if (isNumeric) {
                if(numA < numB) return sortDir === 'asc' ? -1 : 1;
                if(numA > numB) return sortDir === 'asc' ? 1 : -1;
            }else{

                if(aValue < bValue) return sortDir === 'asc' ? -1 : 1;
                if(aValue > bValue) return sortDir === 'asc' ? 1 : -1;
            }

            return 0;
        }
        return 0;
    }) 

    
    return(
        <BaseLayout breadcrumbs={[
            {label: 'INICIO', path: '/inicio'},
            {label: 'PERSONAL', path: '/personal'},
            {label: 'ADMINISTRACION DEL PERSONAL', path: '/admin-personal'},
            {label: 'ADMINISTRACION DE GREMIO', path: '/crud-gremio'}
        ]}>

            <div className={styles.gremioregister}>
                <h3>
                    REGISTRO DE GREMIO PARA EL PERSONAL DE CAMPO
                </h3>

                <form onSubmit={onSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="nombre">Nombre del Gremio</label>
                        <input type="text" name='nombre' id='nombre'
                        {...register("nombre",{required: true})}/>
                        {errors.nombre && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="responsable">Nombre del Responsable</label>
                        <input type="text" name='responsable' id='responsable'
                        {...register("responsable",{required: true})}/>
                        {errors.responsable && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="porcentaje">Porcentaje de personal</label>
                        <input type="number" name='porcentaje' id='porcentaje' step="0.01"
                        {...register("porcentaje", {required: true})}/>
                        {errors.porcentaje && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>

                    <div className={`${styles.formgroup} btn-guardar`}>
                        <button className={styles.btnguardar}>Guardar</button>
                    </div>
                </form>
            </div>
            <div className={styles.gremiolist}>
                <h3 className={styles.gremiolisttitle}>
                    LISTA DE GREMIOS DE PERSONAL DE CAMPO
                </h3>
                <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('nombre')}>NOMBRE {sortColumn === 'nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('responsable')}>RESPONSABLE {sortColumn === 'responsable' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('porcentaje')}>% {sortColumn === 'porcentaje' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedGremio.map(gremio => (
                                <tr key={gremio.id} className="border-b border-gray-500 hover:bg-emerald-100 py-4">
                                    <td className='py-3 w-1/6'>{gremio.id}</td>
                                    <td className='py-3 w-1/6'>{gremio.nombre}</td>
                                    <td className='py-3 w-2/6'>{gremio.responsable}</td>
                                    <td className='py-3 w-1/6'>{gremio.porcentaje}%</td>
                                    <td className='py-3 flex justify-center'>
                                        <div className=''>
                                            <button className="edit-btn hover:bg-teal-500" onClick={() => handleSelectedClick(gremio)} key={gremio.id}>EDITAR</button>
                                        </div>
                                        <div className=''>
                                            <button onClick={async() => {
                                                const accepted = window.confirm('Estas seguro de eliminar este gremio?')
                                                if(accepted){
                                                    await deleteGremio(gremio.id)
                                                    toast.success('Gremio Eliminado');
                                                    setTimeout(() =>{
                                                        navigate(0)
                                                    }, 500)
                                                }
                                            }} id='eliminargremio' name='eliminargremio' className="delete-btn hover:bg-red-400">ELIMINAR</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>

                </table>

                {selected && (
                    <EditGremio gremio={selected} onClose={() => setSelected(null)} />
                )}
            </div>

        </BaseLayout>
    )

}


function EditGremio({gremio, onClose}){
    const [formValues, setFormValues] = useState({
        nombre: gremio.nombre,
        responsable: gremio.responsable,
        porcentaje: gremio.porcentaje
    })

    const handleInputChange = (e) => {
        const{name, value} = e.target;
        setFormValues({
            ...formValues,
            [name]:value
        })
    }

    const handleSubmit2 = async () => {
        try{
            await updateGremio(gremio.id, formValues);
            onClose();
            toast.success('Editado con exito')
            setTimeout(() => {
                window.location.reload();
            }, 700)
        }catch(error){
            toast.error("No se pudo actualizar el gremio")
            console.log(error)
        }
        
    }

    return(
        <div className={styles.modal}>
            <div className={styles.detallegremio}>
                <h2>EDITANDO GREMIO</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formgroup}>
                        <label htmlFor="nombre">Nombre de Rango:</label><br/>
                        <input type="text" name="nombre" id="nombre" value={formValues.nombre} onChange={handleInputChange}/>
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="responsable">Responsable de Gremio:</label><br/>
                        <input type="text" name="responsable" id="responsable" value={formValues.responsable} onChange={handleInputChange}/>
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="porcentaje">Porcentaje de Gremio:</label><br/>
                        <input type="number" name="porcentaje" id="porcentaje" step="0.01" value={formValues.porcentaje} onChange={handleInputChange}/>
                    </div>
                    <div className={styles.modalbtngroup}>
                        <button className="edit-btn hover:bg-teal-500" type="button" onClick={handleSubmit2}>GUARDAR CAMBIOS</button>
                        <button className="cerrar-btn hover:bg-gray-300" onClick={onClose}>CERRAR</button> 
                    </div>
                </form>
            </div>
        </div>
    )
}