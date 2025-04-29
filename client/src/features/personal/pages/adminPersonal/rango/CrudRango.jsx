import styles from './CrudRango.module.css';
import toast from 'react-hot-toast';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import { useForm } from 'react-hook-form';
import { createrango, deleterango, getAllrango, updaterango } from '../../../api/crud-rango.api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CrudRango(){

    const navigate = useNavigate()
    const [rango, setRango] = useState([]);

    useEffect(() => {
        async function loadRango() {
            const res = await getAllrango();
            setRango(res.data);
        }
        loadRango();
    }, [])

    const {
        register,
        handleSubmit,
        formState:{errors},
    } = useForm()

    const onSubmit = handleSubmit(async (data) => {
        try{
            await createrango(data)
            toast.success('Rango creado')
            setTimeout(() => {
                navigate(0)
            }, 800)
        }catch(error){
            toast.error('Error al crear el rango..!')
            console.log(error)
        }
    })


    const [selected, setSelected] = useState(null);

    const handleSelectedClick = rango => {
        setSelected(rango)
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


    const sortedRango = [...rango].sort((a,b) => {
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
            {label: 'ADMINISTRACION DE RANGO', path: '/crud-rango'}
        ]}>

            <div className={styles.rangoregister}>
                <h3>
                    REGISTRO DE RANGO PARA EL PERSONAL DE CAMPO
                </h3>

                <form onSubmit={onSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="nombre">Nombre de Rango</label>
                        <input type="text" name='nombre' id='nombre'
                        {...register("nombre",{required: true})}/>
                        {errors.nombre && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="cxh">Cobro por Hora</label>
                        <input type="number" name='cxh' id='cxh' step="0.01"
                        {...register("cxh", {required: true})}/>
                        {errors.cxh && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>

                    <div className={`${styles.formgroup} btn-guardar`}>
                        <button className={styles.btnguardar}>Guardar</button>
                    </div>
                </form>
            </div>
            <div className={styles.rangolist}>
                <h3 className={styles.rangolisttitle}>
                    LISTA DE RANGOS EN PERSONAL DE CAMPO
                </h3>
                <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('nombre')}>RANGO {sortColumn === 'nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('cxh')}>CxH {sortColumn === 'cxh' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRango.map(rango => (
                                <tr key={rango.id} className="border-b border-gray-500 hover:bg-emerald-100 py-4">
                                    <td className='py-3 w-1/6'>{rango.id}</td>
                                    <td className='py-3 w-2/6'>{rango.nombre}</td>
                                    <td className='py-3 w-2/6'>{rango.cxh}</td>
                                    <td className='py-3 flex justify-center'>
                                        <div className=''>
                                            <button className="edit-btn hover:bg-teal-500" onClick={() => handleSelectedClick(rango)} key={rango.id}>EDITAR</button>
                                        </div>
                                        <div className=''>
                                            <button onClick={async() => {
                                                const accepted = window.confirm('Estas seguro de eliminar este rango?')
                                                if(accepted){
                                                    await deleterango(rango.id)
                                                    toast.success('Rango Eliminado');
                                                    setTimeout(() =>{
                                                        navigate(0)
                                                    }, 500)
                                                }
                                            }} id='eliminarrango' name='eliminarrango' className="delete-btn hover:bg-red-400">ELIMINAR</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>

                </table>

                {selected && (
                    <EditRango rango={selected} onClose={() => setSelected(null)} />
                )}
            </div>

        </BaseLayout>
    )

}

function EditRango({rango, onClose}){
    const [formValues, setFormValues] = useState({
        nombre: rango.nombre,
        cxh: rango.cxh
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
            await updaterango(rango.id, formValues);
            onClose();
            toast.success('Editado con exito')
            setTimeout(() => {
                window.location.reload();
            }, 700)
        }catch(error){
            toast.error("No se pudo actualizar el rango")
            console.log(error)
        }
        
    }

    return(
        <div className={styles.modal}>
            <div className={styles.detallerango}>
                <h2>EDITANDO RANGO</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formgroup}>
                        <label htmlFor="nombre">Nombre de Rango:</label><br/>
                        <input type="text" name="nombre" id="nombre" value={formValues.nombre} onChange={handleInputChange}/>
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="cxh">Costo x Hora:</label><br/>
                        <input type="number" name="cxh" id="cxh" step="0.01" value={formValues.cxh} onChange={handleInputChange}/>
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