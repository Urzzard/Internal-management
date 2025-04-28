import styles from './CrudPcampo.module.css';
import toast from 'react-hot-toast';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllpcampo, createpcampo, deletepcampo, updatepcampo } from '../../../api/crud-pcampo.api';
import { getAllStaff, getEligiblePersonal } from '../../../api/crud-staff.api';
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
    const [staff, setStaff] = useState([]);

    const {register, handleSubmit, formState: {errors}, reset: resetCreateForm, watch: watchCreate, control: controlCreate } = useForm();
    const [imgFileRetcc, setImgFileRetcc] = useState(null);
    const [imgFileDniHijo, setImgFileDniHijo] = useState(null);
    const [previewImgRetcc, setPreviewImgRetcc] = useState(null);
    const [previewImgDniHijo, setPreviewImgDniHijo] = useState(null);

    const watchedGremioId = watchCreate("gremio_id");
    const selectedGremio = gremio.find(g => g.id === parseInt(watchedGremioId, 10));
    const selectedGremioNombreLower = selectedGremio?.nombre.toLowerCase() || '';



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

            const [pcampoRes, personalRes, rangoRes, gremioRes, staffRes] = await Promise.all([
                getAllpcampo(),
                getEligiblePersonal(),
                getAllrango(),
                getAllGremio(),
                getAllStaff()
            ]);
            setPcampo(pcampoRes.data);
            setEligiblePersonal(personalRes.data);
            setRango(rangoRes.data);
            setGremio(gremioRes.data);
            setStaff(staffRes.data)

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


    const handleFileChangeHelper = (e, setFileState, setPreviewState) => {
        const file = e.target.files[0];

        if(file){
            setFileState(file);
            const reader = new FileReader();
            reader.onload = (event) => setPreviewState(event.target.result)
            reader.readAsDataURL(file);
        }
    }

    const handleRemoveImageHelper = (setFileState, setPreviewState, inputId) => {
        setPreviewState(null);
        setFileState(null);
        const fileInput = document.getElementById(inputId);
        if (fileInput) fileInput.value = null;
    }

    /* const {
        register,
        handleSubmit,
        formState:{errors},
    } = useForm() */

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();

        formData.append('personal_id', data.personal_id);
        formData.append('gremio_id', data.gremio_id);
        formData.append('rango_id', data.rango_id || '')
        formData.append('retcc_estado', data.retcc_estado)

        if(selectedGremioNombreLower.includes('casa')){
            formData.append('srecomendado_id', data.srecomendado_id || '')
            formData.append('ruc', data.ruc || '')
            formData.append('c_sol', data.c_sol || '')
        }

        if(imgFileRetcc){
            formData.append('retcc_img', imgFileRetcc);
        }

        if(imgFileDniHijo && selectedGremioNombreLower.includes('sindicato')){
            formData.append('sdni_img_hijo', imgFileDniHijo)
        }

        if(data.retcc_estado !== 'No tiene' && !imgFileRetcc){
            toast.error('La imagen RETCC es requerida si el estado no es "No tiene"')
        }

        // console.log("FormData CREATE:", Object.fromEntries(formData));

        /* Object.keys(data).forEach(key => {
            formData.append(key, data[key])
        })

        if(imagenRetcc){
            formData.append('retcc_img', imagenRetcc);
        } else{
            toast.error('Debes seleccionar una imagen adecuada..!')
            return;
        } */

        try{
            await createpcampo(formData)
            /* for(let [key,value] of formData.entries()){
                console.log(key,value);
            } */
            
            toast.success('Personal de campo creado')
            resetCreateForm();
            setImgFileRetcc(null);
            setImgFileDniHijo(null);
            setPreviewImgRetcc(null);
            setPreviewImgDniHijo(null);
            loadData();
        } catch(error){
            console.error("Error creando Pcampo:", error.response?.data || error);
            toast.error('Error al registrar. Verifica los datos.')

            if(error.response?.data){
                let errorMsg = "Error: ";
                const errorsData = error.response.data;
                Object.keys(errorsData).forEach(key => {
                    const message = Array.isArray(errorsData[key]) ? errorsData[key].join(', ') : errorsData[key];
                    errorMsg += `${key} : ${message}` 
                });

                if(error.response.status === 400 && typeof errorsData === 'object'){
                    toast.error(errorMsg.trim(), {duration: 5000});
                } else {
                    toast.error('Ocurrio un error inesperado al guardar.')
                }
            }
            /* for(let [key,value] of formData.entries()){
                console.log(key,value);
            } */
        }
    })

    /* const handleFileChange = (e) => {
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
    } */

    const handleSelectedClick = pcampo => {
        setSelected(pcampo)
    }

    const handlePcampoUpdated = () => {
        loadData();
    }

    const [sortColumn, setSortColumn] = useState('id');
    const [sortDir, setSortDir] = useState('asc');

    const handleSort = (column) => {
        const currentSortPath = column.split('.');
        if (sortColumn === column){
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')

        } else{
            setSortColumn(column)
            setSortDir('asc')
        }
    }


    const sortedPcampo = [...pcampo].sort((a, b) => {

        const getValue = (obj, path) => {
            try {
               return path.split('.').reduce((o, k) => (o || {})[k], obj);
            } catch(e) {
                return undefined;
            }
        }

       let aValue = getValue(a, sortColumn);
       let bValue = getValue(b, sortColumn);

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDir === 'asc' ? -1 : 1;
        if (bValue == null) return sortDir === 'asc' ? 1 : -1;

        const numA = parseFloat(aValue);
        const numB = parseFloat(bValue);
        if (!isNaN(numA) && !isNaN(numB)) {
            if (numA < numB) return sortDir === 'asc' ? -1 : 1;
            if (numA > numB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
            return sortDir === 'asc' ? comparison : -comparison;
        }

       return 0;
   });

    return(
        <BaseLayout breadcrumbs={[
            {label: 'INICIO', path: '/inicio'},
            {label: 'PERSONAL', path: '/personal'},
            {label: 'ADMINISTRACION DEL PERSONAL', path: '/admin-personal'},
            {label: 'ADMINISTRACION DE PERSONAL DE CAMPO', path: '/crud-pcampo'}
        ]}>

            <div className={styles.pcampoRegister}>
                <h3>REGISTRO DE PERSONAL DE CAMPO</h3>
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
                        {eligiblePersonal.length === 0 && !loading && <span className={styles.info}>No hay personal elegible (ya asignado o no existe).</span>}
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
                    {/* RESALTAR LA POSIBILIDAD DE USAR UN CODIGO QR QUE PERMITA ACCEDER A UN APARTADO EN EL QUE SE PUEDA CARGAR IMAGENES MEDIANTE EL CELULAR*/}
                    {/* UNA DE LAS MANERAS SERIA: ESCANEAR UN CODIGO QR EN ESTE APARTADO Y QUE A SU VEZ ABRA EN EL NAVEGADOR DEL CELULAR UNA INTERFAZ PARECIDA A LA DE PERSONA*/}
                    {/* EN ESTA PERMITIRÁ TOMAR MEDIANTE INDICACIONES UNA IMAGEN DEL DOCUMENTO DE MANERA ANVERSA Y REVERSA PARA QUE ESTA SE CARGUE EN UNA SOLA IMAGEN */}
                    <div className={styles.formgroup}>
                        <label htmlFor="retcc_img">Imagen del carnet</label>
                        <div className={styles.imgbox}>
                            <div className={styles.imgsubox}>
                                <input type="file" name='retcc_img' id='retcc_img' accept='image/*' onChange={(e) => handleFileChangeHelper(e, setImgFileRetcc, setPreviewImgRetcc)}/>
                                {errors.retcc_img && <span className={styles.validacion}>Este campo es requerido..!</span>}
                                <small className=''>
                                    {imgFileRetcc ? `Archivo seleccionado: ${imgFileRetcc.name}` : `No existe imagen Seleccionado`}
                                </small>
                            </div>
                            {previewImgRetcc && (
                                <div className={styles.img_prev_box}>
                                    <img src={previewImgRetcc} alt="vista previa" className='img-preview'/>
                                    <button type='button' className={styles.btnDelete} onClick={() => handleRemoveImageHelper(setImgFileRetcc, setPreviewImgRetcc, 'create_retcc_img')}>
                                        Eliminar Imagen
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedGremioNombreLower.includes('casa') && (
                        <>
                            <hr className={styles.separator} />
                            <h4>Datos Especificos (casa)</h4>
                            <div className={styles.formgroup}>
                                <label htmlFor="srecomendado_id">Staff que recomienda</label>
                                <select id="srecomendado_id" {...register("srecomendado_id")}>
                                    <option value="">Seleccione (Opcional)...</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.user?.username} ({s.personal?.nombre} {s.personal?.a_paterno})</option>)}
                                </select>
                            </div>
                            <div className={styles.formgroup}>
                                <label htmlFor="ruc">RUC *</label>
                                <input type="text" id="ruc" maxLength="11" {...register("ruc", { required: selectedGremioNombreLower.includes('casa') ? "RUC requerido para CASA" : false })} />
                                {errors.ruc && <span className={styles.validacion}>{errors.ruc.message}</span>}
                            </div>
                            <div className={styles.formgroup}>
                                <label htmlFor="c_sol">Clave SOL *</label>
                                <input type="text" id="c_sol" maxLength="50" {...register("c_sol", { required: selectedGremioNombreLower.includes('casa') ? "Clave SOL requerida para CASA" : false })} />
                                {errors.c_sol && <span className={styles.validacion}>{errors.c_sol.message}</span>}
                            </div>
                        </>
                    )}
                    
                    {selectedGremioNombreLower.includes('sindicato') && (
                        <>
                            <hr className={styles.separator} />
                            <h4>Datos Especificos (Sindicato)</h4>
                            <div className={styles.formgroup}>
                                <label htmlFor="sdni_img_hijo">Imagen DNI Hijo</label>
                                <div className={styles.imgbox}>
                                     <div className={styles.imgsubox}>
                                        <input type="file" id="sdni_img_hijo" accept="image/*"
                                               onChange={(e) => handleFileChangeHelper(e, setImgFileDniHijo, setPreviewImgDniHijo)} />
                                         <small>{imgFileDniHijo ? `Nuevo: ${imgFileDniHijo.name}` : 'No hay imagen'}</small>
                                    </div>
                                    {previewImgDniHijo && (
                                        <div className={styles.img_prev_box}>
                                             <img src={previewImgDniHijo} alt="DNI Hijo" className='img-preview' />
                                            <button type='button' className={styles.btnDelete} onClick={() => handleRemoveImageHelper(setImgFileDniHijo, setPreviewImgDniHijo, 'create_sindicato_dni_img_hijo')}>
                                                Eliminar Imagen
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className={`${styles.formgroup} btn-guardar`}>
                        <button type='submit' className={styles.btnguardar} disabled={loading}>
                            {loading ? 'Cargando...' : 'Registrar Personal de Campo'}
                        </button>
                    </div>
                </form>
            </div>
            <div className={styles.pcampolist}>
                <h3 className={styles.rangolisttitle}>
                    LISTA DE PERSONAL DE CAMPO
                </h3>
                {loading ? <p>Cargando lista...</p> : (
                    <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('personal.nombre')}>NOMBRE DE PERSONAL {sortColumn === 'personal.nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('gremio.nombre')}>GREMIO {sortColumn === 'gremio.nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('rango.nombre')}>RANGO {sortColumn === 'rango.nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('retcc_estado')}>ESTADO RETCC {sortColumn === 'retcc_estado' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPcampo.map(pcampo => (
                                <tr key={pcampo.id} className="border-b border-gray-500 hover:bg-emerald-100 py-4">
                                    <td className='py-3 px-2'>{pcampo.id}</td>
                                    <td className='py-3 px-2'>{pcampo.personal?.nombre} {pcampo.personal?.a_paterno}</td>
                                    <td className='py-3 px-2'>{pcampo.gremio?.nombre || 'N/A'}</td>
                                    <td className='py-3 px-2'>{pcampo.rango?.nombre || 'N/A'}</td>
                                    <td className='py-3 px-2'>{pcampo.retcc_estado}</td>
                                    <td className='py-3 flex justify-center'>
                                        <button className="edit-btn hover:bg-teal-500" onClick={() => handleSelectedClick(pcampo)}>EDITAR</button>
                                        <button onClick={async() => {
                                            if(window.confirm(`Estas seguro de eliminar este personal de campo? ${pcampo.personal?.nombre}`)){
                                                try{
                                                    await deletepcampo(pcampo.id)
                                                    toast.success('Personal de campo Eliminado');
                                                    loadData();
                                                }catch (error){
                                                    console.error("Error eliminando Pcampo:", error)
                                                    toast.error("No se pudo eliminar.");
                                                }
                                            }
                                        }} id='eliminarpcampo' name='eliminarpcampo' className="delete-btn hover:bg-red-400">ELIMINAR</button>
                                    </td>
                                </tr>
                            ))}
                            {sortedPcampo.length === 0 && !loading && (
                                <tr><td colSpan="6" className='text-center py-4'>No hay personal de campo registrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
                
                {selected && (
                    <EditPcampo pcampo={selected} onClose={() => setSelected(null)} onPcampoUpdated={handlePcampoUpdated} gremios={gremio} rangos={rango} allStaff={staff}/>
                )}
            </div>

        </BaseLayout>
    )

}

function EditPcampo({pcampo, onClose, gremios = [], rangos = [], allStaff = [], onPcampoUpdated}){
    const {register, handleSubmit, formState:{errors}, setValue, watch, control} = useForm();
    const [previewImgRetcc, setPreviewImgRetcc] = useState(null);
    const [previewImgDniHijo, setPreviewImgDniHijo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imgFileRetcc, setImgFileRetcc] = useState(null);
    const [imgFileDniHijo, setImgFileDniHijo] = useState(null);

    const watchedGremioId = watch("gremio_id");
    const selectedGremio = gremios.find(g => g.id === parseInt(watchedGremioId, 10));
    const selectedGremioNombreLower = selectedGremio?.nombre.toLowerCase() || '';



    useEffect(() => {
        if(pcampo){
            setValue('gremio_id', pcampo.gremio?.id || '');
            setValue('rango_id', pcampo.rango?.id || '');
            setValue('retcc_estado', pcampo.retcc_estado || '');
            setValue('srecomendado_id', pcampo.srecomendado_info?.id || '');
            setValue('ruc', pcampo.ruc || '');
            setValue('c_sol', pcampo.c_sol || '');

            setPreviewImgRetcc(pcampo.retcc_img_url || null);
            setImgFileDniHijo(pcampo.sdni_img_hijo_url || null);

            setImgFileRetcc(null);
            setImgFileDniHijo(null);
            
            /* if(pcampo.retcc_img_url){

                //POSIBLE DILEMA AQUI ¿LA DIRECCION ES CORRECTA?

                setPreviewImgRetcc(pcampo.retcc_img_url)
            } else {
                setPreviewImgRetcc(null)
            }
            setImgFileRetcc(null) */
        }
        
    }, [pcampo, setValue]);

    const handleFileChangeHelper = (e, setFileState, setPreviewState) => {
        const file = e.target.files[0];
        if(file){
            setFileState(file);
            const reader = new FileReader();
            reader.onload = (event) => setPreviewState(event.target.result);
            reader.readAsDataURL(file);
        }
    }

    const handleRemoveImageHelper = (setFileState, setPreviewState, inputId) => {
        setPreviewState(null);
        setFileState(null);
        const fileInput = document.getElementById(inputId);
        if (fileInput) fileInput.value = null;
    };

    /* const handleFileChange = (e) => {
        const file = e.target.files[0]
        if(file){
            setImgFileRetcc(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImgRetcc(event.target.result);
            };
            reader.readAsDataURL(file)
        } else{
            setImgFileRetcc(null);
            setPreviewImgRetcc(pcampo.retcc_img_url ? pcampo.retcc_img_url : null)
        }
    };

    const handleRemoveImg = () => {
        setPreviewImgRetcc(null);
        setImgFileRetcc(null);

        // OTRO DILEMA, SE BORRA LA IMAGEN ANTERIOR POR MANDAR EL CAMPO VACIO?

        const fileInput = document.getElementById('edit_retcc_img');
        if(fileInput) fileInput.value = null;
    } */

    const onEditSubmit = handleSubmit(async (data) => {
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append('gremio_id', data.gremio_id);
        formData.append('rango_id', data.rango_id);
        formData.append('retcc_estado', data.retcc_estado);

        if (selectedGremioNombreLower.includes('casa')){
            formData.append('srecomendado_id', data.srecomendado_id || '')
            formData.append('ruc', data.ruc || '')
            formData.append('c_sol', data.c_sol || '')
        }


        if(imgFileRetcc){
            formData.append('retcc_img', imgFileRetcc)
        } else if(!previewImgRetcc && pcampo.retcc_img_url){
            formData.append('retcc_img', '');
        }

        if(imgFileDniHijo){
            formData.append('sdni_img_hijo', imgFileDniHijo)
        } else if(!previewImgDniHijo && pcampo.sdni_img_hijo_url){
            formData.append('sdni_img_hijo', '');
        }

        /* console.log("FormData a enviar para la actualizacion")
        for(let [key, value] of formData.entries()){
            console.log(key, value)
        } 
            O
            
        console.log("FormData EDIT:",Object.fromEntries(formData));*/

        try{
            await updatepcampo(pcampo.id, formData);
            toast.success('Personal de Campo actualizado correctamente')
            onPcampoUpdated();
            onClose()
        } catch(error){
            console.error("Error actualizando PCampo", error.response?.data || error)
            toast.error('Error al actualizar. Revisa los datos.')

            if(error.response?.data){
                let errorMsg = "Error: ";
                const errorsData = error.response.data;
                Object.keys(errorsData).forEach(key => {
                    const message = Array.isArray(errorsData[key]) ? errorsData[key].join(', ') : errorsData[key];
                    errorMsg += `${key}: ${message}`
                    //errorMsg += `${key}: ${errorsData[key].join ? errorsData[key].join(', ') : errorsData[key]}`
                });
                toast.error(errorMsg.trim())
            }
        } finally{
            setIsSubmitting(false)
        }
    });

    //if(!pcampo) return null

    return(
        <div className={styles.modal}>
            <div className={styles.detallepcampo}>
                <h2>EDITAR PERSONAL DE CAMPO <br /> ({pcampo.personal?.nombre} {pcampo.personal?.a_paterno}) </h2>
                <form onSubmit={onEditSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="gremio_id">Gremio</label>
                        <select name="gremio_id" id="gremio_id" {...register("gremio_id", {required: "Seleccione un gremio"})}>
                            <option value="">Seleccione...</option>
                            {gremios.map(g => (
                                <option key={g.id} value={g.id}>{g.nombre}</option>
                            ))}
                        </select>
                        {errors.gremio_id && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="rango_id">Rango</label>
                        <select name="rango_id" id="rango_id" {...register("rango_id", {required: "Seleccione un rango"})}>
                            <option value="">Seleccione...</option>
                            {rangos.map(r => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </select>
                        {errors.rango_id && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="retcc_estado">Estado del carnet RETCC</label>
                        <select name="retcc_estado" id="retcc_estado" {...register("retcc_estado", {required: "Seleccione el estado"})}>
                            <option value="">Seleccione...</option>
                            <option value="Vigente">Vigente</option>
                            <option value="Vencido">Vencido</option>
                            <option value="No tiene">No tiene</option>
                        </select>
                        {errors.retcc_estado && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="edit_retcc_img">Imagen del carnet RETCC</label>
                        <div className={styles.imgbox}>
                            <div className={styles.imgsubox}>
                                <input type="file" name="edit_retcc_img" id="edit_retcc_img" accept="image/*" onChange={(e) => handleFileChangeHelper(e, setImgFileRetcc, setPreviewImgRetcc)} />
                                <small>
                                    {imgFileRetcc ? `Nuevo: ${imgFileRetcc.name}` : (previewImgRetcc ? 'Imagen actual cargada' : 'No hay imagen')}
                                </small>
                            </div>
                            {previewImgRetcc && (
                                <div className={styles.img_prev_box}>
                                    <img src={previewImgRetcc.startsWith('data:') ? previewImgRetcc : `${previewImgRetcc}`} alt="Vista previa RETCC" className='img-preview' />
                                    <button type='button' className={styles.btnDelete} onClick={() => handleRemoveImageHelper(setImgFileRetcc, setPreviewImgRetcc, 'edit_retcc_img')}>
                                        Eliminar Imagen
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {selectedGremioNombreLower.includes('casa') && (

                        <>
                            <hr className={styles.separator} />
                            <h4>Datos Especificos (CASA)</h4>
                            <div className={styles.formgroup}>
                                <label htmlFor="srecomendado_id">Staff que recomienda</label>
                                <select id="srecomendado_id" {...register("srecomendado_id")}>
                                    <option value="">Seleccione (Opcional)...</option>
                                    {allStaff.map(s => (
                                        <option key={s.id} value={s.id}>{s.user?.username} ({s.personal?.nombre} {s.personal?.a_paterno})</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formgroup}>
                                <label htmlFor="ruc">RUC *</label>
                                <input type="text" id="ruc" maxLength="11" {...register("ruc", { required: selectedGremioNombreLower.includes('casa') ? "RUC requerido para CASA" : false })} />
                                {errors.ruc && <span className={styles.validacion}>{errors.ruc.message}</span>}
                            </div>
                            <div className={styles.formgroup}>
                                <label htmlFor="c_sol">Clave SOL *</label>
                                <input type="text" id="c_sol" maxLength="50" {...register("c_sol", { required: selectedGremioNombreLower.includes('casa') ? "Clave SOL requerida para CASA" : false })} />
                                {errors.c_sol && <span className={styles.validacion}>{errors.c_sol.message}</span>}
                            </div>
                        </>

                    )}

                    {selectedGremioNombreLower.includes('sindicato') && (
                        <>
                            <hr className={styles.separator}/>
                            <h4>Datos Específicos (Sindicato)</h4>
                            <div className={styles.formgroup}>
                                <label htmlFor="sdni_img_hijo">Imagen DNI Hijo</label>
                                <div className={styles.imgbox}>
                                    <div className={styles.imgsubox}>
                                        <input type="file" id="sdni_img_hijo" accept="image/*"
                                               onChange={(e) => handleFileChangeHelper(e, setImgFileDniHijo, setPreviewImgDniHijo)} />
                                         <small>{imgFileDniHijo ? `Nuevo: ${imgFileDniHijo.name}` : (previewImgDniHijo ? 'Imagen actual' : 'No hay imagen')}</small>
                                    </div>
                                    {previewImgDniHijo && (
                                        <div className={styles.img_prev_box}>
                                             <img src={previewImgDniHijo.startsWith('data:') ? previewImgDniHijo : `${previewImgDniHijo}`} alt="DNI Hijo" className='img-preview' />
                                            <button type='button' className={styles.btnDelete} onClick={() => handleRemoveImageHelper(setImgFileDniHijo, setPreviewImgDniHijo, 'sdni_img_hijo')}>
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.sdni_img_hijo && <span className={styles.validacion}>{errors.sdni_img_hijo.message}</span>}
                            </div>
                        </>
                    )}
                    <div className={styles.modalbtngroup}>
                        <button type='submit' className={styles.saveBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button type='button' className={styles.closeBtn} onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}