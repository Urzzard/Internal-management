import styles from './CrudPcampo.module.css';
import toast from 'react-hot-toast';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllpcampo, createpcampo, deletepcampo, updatepcampo } from '../../../api/crud-pcampo.api';
import { getEligiblePersonal } from '../../../api/crud-staff.api';
import { getAllrango } from '../../../api/crud-rango.api';
import { getAllGremio } from '../../../api/crud-gremio.api'

export function CrudPcampo(){

    const navigate = useNavigate()
    const [pcampo, setPcampo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [eligiblePersonal, setEligiblePersonal] = useState([]);
    const [rango, setRango] = useState([]);
    const [gremio, setGremio] = useState([]);
    const [imagenRetcc, setImagenRetcc] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);

    /* useEffect(() => {
        async function loadPcampo() {
            const res = await getAllpcampo();
            setPcampo(res.data);
        }
        loadPcampo();
    }, []) */

    const loadData = async () => {
        setLoading(true);
        try{

            const [pcampoRes, personalRes, rangoRes, gremioRes] = await Promise.all([
                getAllpcampo(),
                getEligiblePersonal(),
                getAllrango(),
                getAllGremio()
            ]);
            setPcampo(pcampoRes.data)
            setEligiblePersonal(personalRes.data)
            setRango(rangoRes.data)
            setGremio(gremioRes.data)

        }catch(error){
            console.error("Error al cargar la información:", error)
            if(error.response?.status === 401 || error.response?.status === 403){
                toast.error("No tienes permisos o tu sesión expiró aqui");
                navigate('/login')
            } else {
                toast.error("Error cargando datos iniciales")
            }
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [navigate]);


    const {
        register,
        handleSubmit,
        formState:{errors},
    } = useForm()

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            formData.append(key, data[key])
        })

        if(imagenRetcc){
            formData.append('retcc_img', imagenRetcc);
        } else{
            toast.error('Debes seleccionar una imagen adecuada..!')
            return;
        }

        try{
            await createpcampo(formData)
            for(let [key,value] of formData.entries()){
                console.log(key,value);
            }
            
            toast.success('Personal de campo creado')
            setImagenRetcc(null)
            setPreviewImg(null)
            setTimeout(() => {
                navigate(0)
            }, 800)
        } catch(error){
            for(let [key,value] of formData.entries()){
                console.log(key,value);
            }
            toast.error('Erro al crear al personal de campo..!')
            console.log(error)
        }
    })

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file){
            setImagenRetcc(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImg(event.target.result)
            };
            reader.readAsDataURL(file);
        }
        setImagenRetcc(file);
    }

    const removeImg = () => {
        setImagenRetcc(null);
        setPreviewImg(null)
    }

    const handleSelectedClick = pcampo => {
        setSelected(pcampo)
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


    const sortedPcampo = [...pcampo].sort((a,b) => {
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
            {label: 'ADMINISTRACION DE PERSONAL DE CAMPO', path: '/crud-pcampo'}
        ]}>

            <div className={styles.pcampoRegister}>
                <h3>
                    REGISTRO DE PERSONAL DE CAMPO
                </h3>

                <form onSubmit={onSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="personal_id">Personal</label>
                        <select name="personal_id" id="personal_id" {...register("personal_id",{required: true})}>
                            <option value="">Seleccione...</option>
                            {eligiblePersonal.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre} {p.a_paterno} {p.a_materno} || DNI: {p.dni}</option>
                            ))}
                        </select>
                        {errors.personal_id && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="gremio_id">Gremio</label>
                        <select name="gremio_id" id="gremio_id" {...register("gremio_id",{required: true})}>
                            <option value="">Seleccione...</option>
                            {gremio.map(g => (
                                <option key={g.id} value={g.id}>{g.nombre}</option>
                            ))}
                        </select>
                        {errors.gremio_id && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="rango_id">Rango</label>
                        <select name="rango_id" id="rango_id" {...register("rango_id",{required: true})}>
                            <option value="">Seleccione...</option>
                            {rango.map(r => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </select>
                        {errors.rango_id && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    {/* RESALTAR LA POSIBILIDAD DE USAR UN CODIGO QR QUE PERMITA ACCEDER A UN APARTADO EN EL QUE SE PUEDA CARGAR IMAGENES MEDIANTE EL CELULAR*/}
                    {/* UNA DE LAS MANERAS SERIA: ESCANEAR UN CODIGO QR EN ESTE APARTADO Y QUE A SU VEZ ABRA EN EL NAVEGADOR DEL CELULAR UNA INTERFAZ PARECIDA A LA DE PERSONA*/}
                    {/* EN ESTA PERMITIRÁ TOMAR MEDIANTE INDICACIONES UNA IMAGEN DEL DOCUMENTO DE MANERA ANVERSA Y REVERSA PARA QUE ESTA SE CARGUE EN UNA SOLA IMAGEN */}
                    <div className={styles.formgroup}>
                        <label htmlFor="retcc_img">Imagen del carnet</label>
                        <div className={styles.imgbox}>
                            <div className={styles.imgsubox}>
                                <input type="file" name='retcc_img' id='retcc_img' onChange={handleFileChange}/>
                                {errors.retcc_img && <span className={styles.validacion}>Este campo es requerido..!</span>}
                                <small className=''>
                                    {imagenRetcc ? `Archivo seleccionado: ${imagenRetcc.name}` : `No existe imagen Seleccionado`}
                                </small>
                            </div>
                            {previewImg && (
                                <div className={styles.img_prev_box}>
                                    <img src={previewImg} alt="vista previa" className='img-preview'/>
                                    <button type='button' className={styles.btnDelete} onClick={removeImg}>
                                        Eliminar Imagen
                                    </button>
                                </div>
                            )}
                        </div>
                        
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="retcc_estado">Estado del carnet</label>
                        <select name="retcc_estado" id="retcc_estado" {...register("retcc_estado",{required: true})}>
                            <option value="">Seleccione...</option>
                            <option value="Vigente">Vigente</option>
                            <option value="Vencido">Vencido</option>
                            <option value="No tiene">No tiene</option>
                        </select>
                        {errors.retcc_estado && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>

                    <div className={`${styles.formgroup} btn-guardar`}>
                        <button className={styles.btnguardar}>Guardar</button>
                    </div>
                </form>
            </div>
            <div className={styles.pcampolist}>
                <h3 className={styles.rangolisttitle}>
                    LISTA DE PERSONAL DE CAMPO
                </h3>
                <table className='min-w-full'>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                            <th onClick={() => handleSort('personal.nombre')}>NOMBRE DE PERSONAL {sortColumn === 'personal.nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                            <th onClick={() => handleSort('gremio.nombre')}>GREMIO {sortColumn === 'gremio.nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                            <th onClick={() => handleSort('rango.nombre')}>RANGO {sortColumn === 'rango.nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPcampo.map(pcampo => (
                            <tr key={pcampo.id} className="border-b border-gray-500 hover:bg-emerald-100 py-4">
                                <td className='py-3 w-1/6'>{pcampo.id}</td>
                                <td className='py-3 w-2/6'>{pcampo.personal?.nombre}</td>
                                <td className='py-3 w-2/6'>{pcampo.gremio?.nombre}</td>
                                <td className='py-3 w-2/6'>{pcampo.rango?.nombre}</td>
                                <td className='py-3 flex justify-center'>
                                    <div className=''>
                                        <button className="edit-btn hover:bg-teal-500" onClick={() => handleSelectedClick(pcampo)} key={pcampo.id}>EDITAR</button>
                                    </div>
                                    <div className=''>
                                        <button onClick={async() => {
                                            const accepted = window.confirm('Estas seguro de eliminar este personal de campo?')
                                            if(accepted){
                                                await deletepcampo(pcampo.id)
                                                toast.success('Personal de campo Eliminado');
                                                setTimeout(() =>{
                                                    navigate(0)
                                                }, 500)
                                            }
                                        }} id='eliminarpcampo' name='eliminarpcampo' className="delete-btn hover:bg-red-400">ELIMINAR</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        
                    </tbody>
                </table>
                {selected && (
                    <EditPcampo pcampo={selected} onClose={() => setSelected(null)}/>
                )}
            </div>

        </BaseLayout>
    )

}

/* function EditPcampo({pcampo, onClose}){
    const [ formValues, setFormValues] = useState({
        gremio: pcampo.gremio_id,
        rango: pcampo.rango_id,
        retcc_img: pcampo.retcc_img,
        retcc_estado: pcampo.retcc_estado
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormValues({
            ...formValues,
            gremio,
            [name]:value
        })
    }

    const handleSubmit2 = async () => {
        try{
            await updatepcampo(pcampo.id, formValues);
            onClose();
            toast.success('Personal de Campo actualizado')
            setTimeout(() => {
                window.location.reload()
            }, 700)
        }catch(error){
            toast.error('No se pudo actualizar al personal de campo')
            console.log(error)
        }
    }

    return(
        <div className={styles.modal}>
            <div className={styles.detallepcampo}>
                <h2>EDITAR PERSONAL DE CAMPO</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label htmlFor="gremio_id">Gremio</label>
                        <select name="gremio_id" id="gremio_id">
                            {gremio.map(g => (
                                <option value={g.gremio}>{g.gremio}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>
        </div>
    )
} */