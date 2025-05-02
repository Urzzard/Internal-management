import React, { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getAllPers, createPers, deletePers, updatePers } from "../../api/crud-personal.api";
import { getPaises, getRegiones, getProvincias, getDistritos } from "../../../../api/info-geografica.api";
import { BaseLayout } from "../../../../components/layout/BaseLayout";
import './Personal.css'
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../api/axios";

export function CrudPersonal(){

    //countriesurl = "http://api.geonames.org/countryInfoJSON?username=urzzard" /* countryCode to get the country */
    //departmentsurl = "http://api.geonames.org/searchJSON?country=PE&featureCode=ADM1&username=urzzard" /* geonameId to get the provinces */
    //provinceurl = "http://api.geonames.org/childrenJSON?geonameId=3691099&username=urzzard" /* geonameId to get the district */
    //distritc = "http://api.geonames.org/childrenJSON?geonameId=3691099&username=urzzard" 

    //PARA LISTAR PAISES

    const [pais, setPais] = useState([]);
    const [region, setRegion] = useState([]);
    const [provincia, setProvincia] = useState([]);
    const [distrito, setDistrito] = useState([]);

    const [selectedPais, setSelectedPais] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedProvincia, setSelectedProvincia] = useState("");
    //const [selectedDistrito, setSelectedDistrito] = useState("")

    const {user} = useAuth();
    const [loading, setLoading] = useState(true);
    const [u, setU] = useState([]);
    const [selected, setSelected] = useState(null)
    const [visible, setVisible] = useState(false)
    const [visibleI, setVisibleI] = useState(false)
    const [exporting, setExporting] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(null)
    

    const [imagenDni, setImagenDni] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const navigate = useNavigate()


    useEffect(() =>{
        const fetchpais = async () =>{
            try{
                const data = await getPaises();
                setPais(data);
            } catch (error){
                console.error("Error en componente al cargar paises:", error);
            }
        };
        fetchpais();
    }, []);

    useEffect(() => {
        if (!selectedPais) {
            setRegion([]);
            setProvincia([]);
            setDistrito([]);
            setSelectedRegion("");
            setSelectedProvincia("");
            return;
        } 

        const fetchregion = async () => {
            try {
                const data = await getRegiones(selectedPais);
                setRegion(data);
                setProvincia([]);
                setDistrito([]);
                setSelectedRegion("");
                setSelectedProvincia("");
            } catch (error){
                console.error("Error en componente al cargar regiones:", error);
            }
        };
        fetchregion();
    }, [selectedPais]);


    useEffect(() => {
        if (!selectedRegion) {
            setProvincia([]);
            setDistrito([]);
            setSelectedProvincia("")
            return;
        };

        const fetchprovincia = async () => {
            try {
                const data = await getProvincias(selectedRegion);
                setProvincia(data);
                setDistrito([]);
                setSelectedProvincia("")
            } catch (error){
                console.error("Error en componente al cargar provincias:", error);
            }
        };
        fetchprovincia();
    }, [selectedRegion]);

    useEffect(() => {
        if (!selectedProvincia) {
            setDistrito([])
            return
        };

        const fetchdistrito = async () => {
            try {
                const data = await getDistritos(selectedProvincia);
                setDistrito(data);
            } catch (error){
                console.error("Error en componente al cargar distritos:", error);
            }
        };
        fetchdistrito();
    }, [selectedProvincia]);


    //PARA CARGAR LOS DATOS DE LA API

    useEffect(() => {
        setLoading(true)
        async function loadU() {
            try{
                const res = await getAllPers();
                setU(res.data);
            }catch(error){
                console.error("Error loading personal:", error);
                toast.error("Error al cargar la lista de personal.")
            } finally{
                setLoading(false);
            }
            
        }
        loadU();
    }, [])
    


    //PARA CREAR O REGISTRAR DATOS EN LA API
    const {
        register, 
        handleSubmit, 
        formState:{errors},
        reset: resetCreateForm,
        watch: watchCreate
    } = useForm()



    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if(['pais', 'region', 'provincia', 'distrito'].includes(key) && data[key]){
                formData.append(`${key}_id`, data[key])
            } else if(key === 'dni_img'){
                //
            } else if(data[key] !== null && data[key] !== undefined){
                formData.append(key, data[key]);
            }
        });
        

        if(imagenDni){
            formData.append("dni_img", imagenDni);
        } else {
            toast.error('Debes seleccionar una imagen');
            return;
        }

        try{
            await createPers(formData);
            toast.success('Usuario Creado');
            setImagenDni(null);
            setPreviewImg(null);
            resetCreateForm();
            setVisible(false);
            setLoading(true);
            const res = await getAllPers();
            setU(res.data);
            setLoading(false);
        } catch (error){
            toast.error('Error al crear usuario!!');
            console.error("Error creando personal:", error.response?.data || error);
            if (error.response?.data) {
                let errorMsg = "Error: ";
                const errorsData = error.response.data;
                Object.keys(errorsData).forEach(key => {
                    const message = Array.isArray(errorsData[key]) ? errorsData[key].join(', ') : errorsData[key];
                    errorMsg += `${key}: ${message} `;
                });
                 toast.error(errorMsg.trim(), { duration: 5000 });
            }
        }

        
    })

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if(file){
            setImagenDni(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImg(event.target.result);
            };
            reader.readAsDataURL(file);
        } else{
            setImagenDni(null);
            setPreviewImg(null);
        }
        setImagenDni(file);
    }

    const removeImg = () =>{
        setImagenDni(null);
        setPreviewImg(null);
        const fileInput = document.getElementById('dni_img');
        if(fileInput) fileInput.value = null;
    };


    //PARA EDITAR - ABRIR MODAL



    const handleSelectedClick = (u) =>{
        setSelected(u)
    }


    //EXTRAS SLIDE DE REGISTRO O IMPORT



    const slide = () => {
        setVisible(!visible);
        if(visibleI){
            setVisibleI(false)
        }
    }

    const slideI = () => {
        setVisibleI(!visibleI);
        if(visible){
            setVisible(false)
        }
    }



    // ORDEN Y FILTRO

     const [sortColumn, setSortColumn] = useState('id');
     const [sortDir, setSortDir] = useState('asc');
 
     const handleSort = (column) => {
         if (sortColumn === column){
             setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
 
         } else{
             setSortColumn(column)
             setSortDir('asc')
         }
     }
 
 
     const sortedU = [...u].sort((a,b) => {
        if (!sortColumn) return 0;
        const aValue = sortColumn.split('.').reduce((o, k) => (o || {})[k], a);
        const bValue = sortColumn.split('.').reduce((o, k) => (o || {})[k], b);
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
     })



     /* useEffect(() => {
        const imgdni = document.getElementById('img_dni')
        if (imgdni){
            imgdni.addEventListener('change', function (e){
                const fileName = e.target.files[0] ? e.target.files[0].name: 'Ningún archivo seleccionado';
                const fileSpan = document.getElementById('fileName')
                if (fileSpan){
                    fileSpan.textContent = fileName;
                }
             })
        }
     }, []) */

     const handleExportPersonalCSV = async () => {

        setExporting(true);
        toast.loading("Generando CSV...", {id: 'export-toast'});

        try{
            const response = await api.get('/personal/api-personal/Personal/export-csv/',{
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            let filename = 'personal_export.csv';
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition){
                const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
                if(filenameMatch && filenameMatch.length > 1){
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click()

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("CSV generado y descarga iniciada.", {id: 'export-toast'});
            
        } catch (error){
            console.error("Error al exportar CSV:", error.response || error);
            toast.error("Error al generar el archivo CSV.", {id: 'export-toast'});

            if(error.response?.status === 401 || error.response?.status === 403){
                toast.error("No tienes permiso para exportar.", {id: 'export-toast'});
            }
        } finally {
            setExporting(false);
        }

    }

    const handleGeneratePdf = async (personalId, personaNombre) => {
        setGeneratingPdf(personalId);
        toast.loading(`Generando ficha PDF para ${personaNombre}...`, {id: `pdf-toast-${personalId}`});

        try{
            const response = await api.get(`/personal/api-personal/Personal/${personalId}/ficha-pdf/`,{
                responseType: 'blob',
            });

            const file = new Blob([response.data], {type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);

            window.open(fileURL, '_blank');
            toast.success(`Ficha PDF generada.`, {id: `pdf-toast-${personalId}`})
        } catch (error){
            console.error("Error al generar PDF:", error.response || error);
            toast.error(`Error al generar ficha PDF.`, {id: `pdf-toast-${personalId}`});
            
            if(error.response?.status === 401 || error.response?.status === 403){
                toast.error("Notienes permiso para ver esta ficha.", {id: `pdf-toast-${personalId}`});
            } else if(error.response?.status === 404) {
                toast.error("Registro de personal no encontrado.", {id: `pdf-toast-${personalId}`});
            }
        } finally {
            setGeneratingPdf(null);
        }
    }


     return(
        <div className={`personal ${selected ? "modal-open": ""}`}>

                <BaseLayout breadcrumbs={[
                    {label: 'INICIO', path: '/inicio'},
                    {label: 'PERSONAL', path: '/personal'},
                    {label: 'CRUD PERSONAL', path: '/crud-personal'}
                ]}>
                {user.is_superuser && (
                    <div className="crear">
                        <h2 onClick={slide} style={{cursor:'pointer'}}>REGISTRAR NUEVO PERSONAL {visible ? '▲' : '▼'}</h2>
                        {(visible &&
                            <form onSubmit={onSubmit}>
                                <div className="f1">
                                    <div className="rp-nombre">
                                        <label htmlFor="nombre">Nombre:</label>
                                        <input type="text" name="nombre" className="form-control" id="nombre"
                                            {...register("nombre", {required: true})}
                                        />
                                        {errors.nombre && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-a_paterno">
                                        <label htmlFor="a_paterno">Apellido Paterno:</label>
                                        <input type="text" name="a_paterno" className="form-control" id="a_paterno"
                                            {...register("a_paterno", {required: true})}
                                        />
                                        {errors.a_paterno && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-a_materno">
                                        <label htmlFor="a_materno">Apellido Materno:</label>
                                        <input type="text" name="a_materno" className="form-control" id="a_materno"
                                            {...register("a_materno", {required: true})}
                                        />
                                        {errors.a_materno && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-dni">
                                        <label htmlFor="dni">DNI:</label>
                                        <input type="number" name="dni" className="form-control" id="dni" maxLength={8}
                                            {...register("dni", {required: true})}
                                        />
                                        {errors.dni && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                </div>
                                <div className="f2">
                                    <div className="rp-dni_img">
                                        <label htmlFor="dni_img">Imagen de DNI:</label>
                                        <div className="dni_img_box">
                                            <div className="dni_img_subbox">
                                                <input type="file" name="dni_img" id="dni_img" onChange={handleFileChange}/>
                                                {errors.dni_img && <span className="validacion1" >Este campo es requerido!!</span>}
                                                <small className="form-text text-muted">
                                                    {imagenDni ? `Archivo seleccionado: ${imagenDni.name}` : `No existe imagen seleccionada`}
                                                </small>
                                            </div>
                                            
                                            {previewImg && (
                                                <div className="img_prev_box">
                                                    <img src={previewImg} alt="vista previa" className="img-preview" />
                                                    <button type="button" className="rmv_img_btn" onClick={removeImg}>
                                                        Eliminar imagen
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                    </div>

                                    <div className="rp-f_nacimiento">
                                        <label htmlFor="f_nacimiento">Fecha de Nacimiento:</label>
                                        <input type="date" name="f_nacimiento" className="form-control" id="f_nacimiento"
                                            {...register("f_nacimiento", {required: true})}
                                        />
                                        {errors.f_nacimiento && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-celular">
                                        <label htmlFor="celular">Celular:</label>
                                        <input type="number" name="celular" className="form-control" id="celular" maxLength={9}
                                            {...register("celular", {required: true})}
                                        />
                                        {errors.celular && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-nro_emergencia">
                                        <label htmlFor="nro_emergencia">N. Emergencia:</label>
                                        <input type="number" name="nro_emergencia" className="form-control" id="nro_emergencia" maxLength={9}
                                            {...register("nro_emergencia", {required: true})}
                                        />
                                        {errors.nro_emergencia && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                </div>

                                <div className="f3">
                                    <div className="rp-pais">
                                        <label htmlFor="pais">Pais:</label>
                                        <select name="pais" id="pais" className="form-control" value={selectedPais}
                                        {...register("pais", { required: "Pais requerido", onChange: (e) => setSelectedPais(e.target.value) })}>
                                                <option value="">Seleccione un Pais</option>
                                                {pais.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.nombre}
                                                    </option>
                                                ))}
                                                
                                        </select>
                                        {errors.pais && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>

                                    <div className="rp-region">
                                        <label htmlFor="region">Region:</label>
                                        <select name="region" id="region" className="form-control" value={selectedRegion} disabled={!region.length}
                                            {...register("region", { required: "Region requerida", onChange: (e) => setSelectedRegion(e.target.value) })}>
                                                <option value="">Seleccione una Region</option>
                                                {region.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.nombre}
                                                    </option>
                                                ))}
                                            
                                        </select>
                                        {errors.region && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>

                                    <div className="rp-provincia">
                                        <label htmlFor="provincia">Provincia:</label>
                                        <select name="provincia" id="provincia" className="form-control" value={selectedProvincia} disabled={!provincia.length}
                                            {...register("provincia", { required: "Provincia requerida", onChange: (e) => setSelectedProvincia(e.target.value) })}>
                                                <option value="">Seleccione una Provincia</option>
                                                {provincia.map((prov) => (
                                                    <option key={prov.id} value={prov.id}>
                                                        {prov.nombre}
                                                    </option>
                                                ))}
                                            
                                        </select>
                                        {errors.provincia && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>

                                    <div className="rp-distrito">
                                        <label htmlFor="distrito">Distrito:</label>
                                        <select name="distrito" id="distrito" className="form-control" disabled={!distrito.length}
                                            {...register("distrito", { required: "Distrito requerido"})}>
                                                <option value="">Seleccione una Distrito</option>
                                                {distrito.map((dist) => (
                                                    <option key={dist.id} value={dist.id}>
                                                        {dist.nombre}
                                                    </option>
                                                ))}
                                            
                                        </select>
                                        {errors.distrito && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                </div>


                                <div className="f4">
                                    <div className="rp-direccion">
                                        <label htmlFor="direccion">Direccion:</label>
                                        <input type="text" name="direccion" className="form-control" id="direccion"
                                            {...register("direccion", {required: true})}
                                        />
                                        {errors.direccion && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-sexo">
                                        <label htmlFor="sexo">Sexo:</label>
                                        <select name="sexo" id="sexo" className="form-control"
                                            {...register("sexo", {required: true})}>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                        </select>
                                        {errors.sexo && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-e_civil">
                                        <label htmlFor="e_civil">Estado Civil:</label>
                                        <select name="e_civil" id="e_civil" className="form-control"
                                            {...register("e_civil", {required: true})}>
                                            <option value="Solter@">Solter@</option>
                                            <option value="Casad@">Casad@</option>
                                            <option value="Divorciad@">Divorciad@</option>
                                            <option value="Viud@">Viud@</option>
                                        </select>
                                        {errors.e_civil && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-t_polo">
                                        <label htmlFor="t_polo">T. Polo:</label>
                                        <input type="text" name="t_polo" className="form-control" id="t_polo" maxLength={3}
                                            {...register("t_polo", {required: true})}
                                        />
                                        {errors.t_polo && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-t_pantalon">
                                        <label htmlFor="t_pantalon">T. Pantalon:</label>
                                        <input type="number" name="t_pantalon" className="form-control" id="t_pantalon" maxLength={2}
                                            {...register("t_pantalon", {required: true})}
                                        />
                                        {errors.t_pantalon && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-t_zapato">
                                        <label htmlFor="t_zapato">T. Zapato:</label>
                                        <input type="number" name="t_zapato" className="form-control" id="t_zapato" maxLength={2}
                                            {...register("t_zapato", {required: true})}
                                        />
                                        {errors.t_zapato && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                </div>

                                <div className="f5">
                                    <div className="rp-email">
                                        <label htmlFor="email">Email:</label>
                                        <input type="text" name="email" className="form-control" id="email"
                                            {...register("email", {required: true})}
                                        />
                                        {errors.email && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-cuenta_corriente">
                                        <label htmlFor="cuenta_corriente">Cuenta Corriente:</label>
                                        <input type="number" name="cuenta_corriente" className="form-control" id="cuenta_corriente" maxLength={18}
                                            {...register("cuenta_corriente", {required: true})}
                                        />
                                        {errors.cuenta_corriente && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-cci">
                                        <label htmlFor="cci">Cuenta Interbancaria:</label>
                                        <input type="number" name="cci" className="form-control" id="cci" maxLength={20}
                                            {...register("cci", {required: true})}
                                        />
                                        {errors.cci && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-f_ingreso">
                                        <label htmlFor="f_ingreso">Fecha de Ingreso:</label>
                                        <input type="date" name="f_ingreso" className="form-control" id="f_ingreso"
                                            {...register("f_ingreso", {required: true})}
                                        />
                                        {errors.f_ingreso && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    <div className="rp-estado">
                                        <label htmlFor="estado">Estado Usuario:</label>
                                        <select name="estado" id="estado" className="form-control"
                                            {...register("estado", {required: true})}>
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                            <option value="Despedido">Despedido</option>
                                        </select>
                                        {errors.estado && <span className="validacion1" >Este campo es requerido!!</span>}
                                    </div>
                                    
                                </div>

                                <div className="f6">
                                    
                                </div>

                                
                                    
                                <div className="btn-guardar ">
                                    <button className="hover:bg-teal-500">Guardar</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
                <div className="mostrar">
                    {user.is_superuser && (
                        <button onClick={handleExportPersonalCSV} className="exportButton" title="Exportar lista a CSV" disabled={exporting || loading}>
                            {exporting ? 'Exportando...' : 'Exportar a CSV'}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                    )}
                    <h2> LISTA DE PERSONAL REGISTRADO EN OBRA </h2>
                    
                    {loading ? <p>Cargando...</p> : (
                        <table className="min-w-ful ">
                            <thead>
                                <tr >
                                    <th className="u-id" onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                    <th className="u-nombre" onClick={() => handleSort('nombre')}>NOMBRE {sortColumn === 'nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                    <th className="u-a_paterno" onClick={() => handleSort('a_paterno')}>A. PATERNO {sortColumn === 'a_paterno' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                    <th className="u-a_materno" onClick={() => handleSort('a_materno')}>A. MATERNO {sortColumn === 'a_materno' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                    <th className="u-dni" onClick={() => handleSort('dni')}>DNI {sortColumn === 'dni' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                    <th className="u-edad" onClick={() => handleSort('edad')}>EDAD {sortColumn === 'edad' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                    <th className="u-f_ingreso" onClick={() => handleSort('f_ingreso')}>F. INGRESO {sortColumn === 'f_ingreso' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                    {user.is_superuser && (<th className="u-opciones">OPCIONES</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedU.map(u => (
                                    <tr key={u.id} className="border-b border-gray-500 hover:bg-emerald-100">
                                        <td>{u.id}</td>
                                        <td>{u.nombre}</td>
                                        <td>{u.a_paterno}</td>
                                        <td>{u.a_materno}</td>
                                        <td>{u.dni}</td>
                                        <td>{u.edad}</td>
                                        <td>{u.f_ingreso}</td>
                                        {user.is_superuser && (
                                            <td className="m-btn">
                                                <div className="edit">
                                                    <button className="edit-btn hover:bg-teal-500" onClick={() => handleSelectedClick(u)} key={u.id}>EDITAR</button> 
                                                </div>
                                                <div className="pdf">
                                                    <button className="pdf-btn hover:bg-blue-400" onClick={() => handleGeneratePdf(u.id, `${u.nombre} ${u.a_paterno}`)} title="Generar Ficha PDF" disabled={generatingPdf === u.id}>
                                                        {generatingPdf === u.id ? 'Generando...' : 'PDF'}
                                                    </button>
                                                </div>
                                                <div className="delete">
                                                    <button onClick={async() => {
                                                        const accepted = window.confirm('Estas seguro de eliminar este Usuario?')
                                                        if(accepted){
                                                            await deletePers(u.id)
                                                            toast.success('Usuario Eliminado');
                                                            setTimeout(() =>{
                                                                navigate(0)
                                                            }, 500)
                                                        }
                                                    }} id="eliminarusuario" name="eliminarusuario" value="" className="delete-btn hover:bg-red-400">ELIMINAR</button>
                                                </div>
                                            </td>
                                        )}
                                        
                                    </tr>
                                ))}
                                
                            </tbody>
                            
                        </table>
                    )}

                    
                    
                </div>
                </BaseLayout>
            {/* </div> */}
            {selected &&(
                <EditarUsuario u={selected} onClose={() =>setSelected(null)} onPersonalUpdated={() => {
                    setLoading(true);
                    getAllPers().then(res => setU(res.data)).finally(() => setLoading(false));
                    setSelected(null)
                }} />
            )}
        </div>
    )
}


function EditarUsuario({u, onClose, onPersonalUpdated}){

    const [pais, setPais] = useState([])
    const [region, setERegion] = useState([]);
    const [provincia, setEProvincia] = useState([]);
    const [distrito, setEDistrito] = useState([]);
    const [loadingGeo, setLoadingGeo] = useState(false);
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setValue,
        watch
    } = useForm()

    const [previewImg, setPreviewImg] = useState(null);
    const [imgDniFile, setImgDniFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchedPais = watch("pais_id")
    const watchedRegion = watch("region_id")
    const watchedProvincia = watch("provincia_id")

    /* console.log("Usuario recibido:", u) */
    useEffect(() => {
        if(u){
            const defaultVaues ={
                nombre: u.nombre || '',
                a_paterno: u.a_paterno || '',
                a_materno: u.a_materno || '',
                dni: u.dni || '',
                //dni_img: u.dni_img,
                f_nacimiento: u.f_nacimiento || '',
                f_ingreso: u.f_ingreso || '',
                //edad: u.edad || '',
                email: u.email || '',
                pais: u.pais?.id || '',
                region: u.region?.id || '',
                provincia: u.provincia?.id || '',
                distrito: u.distrito?.id || '',
                cuenta_corriente: u.cuenta_corriente || '',
                cci: u.cci || '',
                t_zapato: u.t_zapato || '',
                t_polo: u.t_polo || '',
                t_pantalon: u.t_pantalon || '',
                celular: u.celular || '',
                nro_emergencia: u.nro_emergencia || '',
                direccion: u.direccion || '',
                e_civil: u.e_civil || '',
                sexo: u.sexo || '',
                estado: u.estado || 'Activo',
            };
            reset(defaultVaues);
            
            setPreviewImg(u.dni_img_url ? `http://localhost:8000${u.dni_img_url}` : null)
            setImgDniFile(null)

            setLoadingGeo(true)
            getPaises().then(data => setPais(data)).catch(err => console.error("Error inicial cargando paises", err)).finally(() => setLoadingGeo(false));
        }
    }, [u, reset]);

    useEffect(() => {
        if (!watchedPais) {
            setERegion([]);
            setEProvincia([]);
            setEDistrito([]);
            return;
        }
        setLoadingGeo(true);
        getRegiones(watchedPais).then(data => {setERegion(data); setEProvincia([]); setEDistrito([]);}).catch(err => console.error("Error cargando regiones modal", err)).finally(() => setLoadingGeo(false));
    }, [watchedPais])
    
    useEffect(() => {
        if (!watchedRegion) {
            setEProvincia([]);
            setEDistrito([]);
            return;
        }
        setLoadingGeo(true);
        getProvincias(watchedRegion).then(data => {setEProvincia(data); setEDistrito([]);}).catch(err => console.error("Error cargando provincias modal", err)).finally(() => setLoadingGeo(false));
    }, [watchedRegion])
    
    useEffect(() => {
        if (!watchedProvincia) {
            setEDistrito([]);
            return;
        }
        setLoadingGeo(true);
        getDistritos(watchedProvincia).then(data => {setEDistrito(data);}).catch(err => console.error("Error cargando regiones modal", err)).finally(() => setLoadingGeo(false));
    }, [watchedProvincia])
    

    /* useEffect(() => {
        if(u.dni_img){
            if(typeof u.dni_img === 'string'){
                setPreviewImg(`http://localhost:8000${u.dni_img}`)
            }
        }
    }, [u.dni_img]) */

    const handleInputChange = (e) => {
        const {name, files} = e.target;

        if(name === 'dni_img_file' && files && files[0]){
            const file = files[0];
            setImgDniFile(file);
            const reader = new FileReader();
            reader.onload = (event) => setPreviewImg(event.target.result);
            reader.readAsDataURL(file);
            /* const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImg(event.target.result)
            }
            reader.readAsDataURL(files[0]);

            setFormValues({
                ...formValues,
                [name]: files[0]
            })
        } else{
            setFormValues({
                ...formValues,
                [name]: value
            }) */
        }
    }

    const removeEditImg = () => {
        setPreviewImg(null);
        setImgDniFile(null);
        const fileInput = document.getElementById('dni_img');
        if(fileInput) fileInput.value = null;
    }

    const handleSubmit2 = handleSubmit(async(data) => {
        setIsSubmitting(true);
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if(key !== 'dni_img' && data[key] !== null && data[key] !== undefined){
                formData.append(key, data[key] === null ? '' : data[key])
                /* if(typeof formValues[key] === 'string'){
                    formData.append(key, formValues[key]);
                }
                else if(formValues[key] instanceof File){
                    formData.append(key, formValues[key]);
                }
                return; */
            } 

            /* if(key === 'loguear'){
                formData.append(key, formValues[key] ? 'true' : 'false');
                return;
            }
            formData.append(key, formValues[key]); */
        })

        if(imgDniFile){
            formData.append('dni_img', imgDniFile);
        } else if(!previewImg && u.dni_img_url){
            formData.append('dni_img', '')
        }

        /* for(let [key,value] of formData.entries()){
            console.log(key,value);
        } */

        try {
            await updatePers(u.id, formData);
            toast.success('Editado con exito')
            onPersonalUpdated()
        } catch (error) {
            toast.error('Error al actualizar usuario');
            console.error("Error detallado: ", error.response?.data || error);
            if(error.response?.data){
                let errorMsg = "Error:";
                const errorsData = error.response.data;
                Object.keys(errorsData).forEach(key => {
                    const message = Array.isArray(errorsData[key]) ? errorsData[key].join(', ') : errorsData[key];
                    errorMsg += `${key}: ${message} `;
                });
                toast.error(errorMsg.trim(), { duration: 5000 });
            }
        } finally{
            setIsSubmitting(false);
        }    
    });


    return(
        <div className="modal">
            <div className="detalle-usuario">
                <h2>EDITANDO PERSONAL</h2>
                <form onSubmit={handleSubmit2}>
                    <div className="m-f1">
                        <div className="eu-nombre">
                            <label htmlFor="nombre">Nombre:</label><br/>
                            <input type="text" name="nombre" className="form-control" id="nombre" {...register("nombre", {required: true})}/>
                            {errors.nombre && <span className="validacion1">Requerido...</span>}
                        </div> 
                        <div className="eu-a_paterno">
                            <label htmlFor="a_paterno">A. Paterno:</label><br/>
                            <input type="text" name="a_paterno" className="form-control" id="a_paterno" {...register("a_paterno", {required: true})}/>
                            {errors.a_paterno && <span className="validacion1">Requerido...</span>}
                        </div> 
                        <div className="eu-a_materno">
                            <label htmlFor="a_materno">A. Materno:</label><br/>
                            <input type="text" name="a_materno" className="form-control" id="a_materno" {...register("a_materno", {required: true})}/>
                            {errors.a_materno && <span className="validacion1">Requerido...</span>}
                        </div>
                        <div className="eu-dni">
                            <label htmlFor="dni">DNI:</label><br/>
                            <input type="number" name="dni" className="form-control" id="dni" {...register("dni", {required: true})}/>
                            {errors.dni && <span className="validacion1">Requerido...</span>}
                        </div>
                    </div>

                    <div className="m-f2">
                        <div className="eu-dni_img">
                            <label htmlFor="dni_img">Imagen de DNI:</label><br/>
                            <div className="dni_img_box">
                                <div className="dni_img_subbox">
                                    <input type="file" name="dni_img" id="dni_img" onChange={handleInputChange}/>
                                    <small className="form-text text-muted">
                                        {/* {formValues.dni_img && typeof formValues.dni_img === 'string' 
                                            ? `Archivo actual: ${formValues.dni_img.split('/').pop()}`
                                            : formValues.dni_img instanceof File 
                                                ? `Nuevo archivo: ${formValues.dni_img.name}`
                                                : 'No hay imagen seleccionada'} */}
                                        {imgDniFile ? `Nuevo: ${imgDniFile.name}` : (previewImg ? 'Imagen actual' : 'Sin Imagen')}
                                    </small>
                                </div>
                                
                                {previewImg && (
                                    <div className="image-preview-container">
                                        <img src={previewImg} alt="Vista previa DNI" className="image-preview"/>
                                        <button type="button" className="remove-image-btn" onClick={removeEditImg}>
                                            Eliminar imagen
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div> 
                        <div className="eu-f_nacimiento">
                            <label htmlFor="f_nacimiento">F. Nacimiento:</label><br/>
                            <input type="date" name="f_nacimiento" className="form-control" id="f_nacimiento" {...register("f_nacimiento", {required: true})}/>
                            {errors.f_nacimiento && <span className="validacion1">Requerido...</span>}
                        </div>
                        <div className="eu-edad">
                            <label htmlFor="edad">Edad (Calculada):</label><br/>
                            <input type="number" name="edad" className="form-control" id="edad" value={u.edad || ''} readOnly disabled/>
                        </div> 
                    </div>
                    
                    <div className="m-f3">
                        <div className="eu-f_ingreso">
                                <label htmlFor="f_ingreso">F. Ingreso:</label><br/>
                                <input type="date" name="f_ingreso" className="form-control" id="f_ingreso" {...register("f_ingreso", {required: true})}/>
                                {errors.f_ingreso && <span className="validacion1">Requerido...</span>}
                            </div> 
                        
                        <div className="eu-email">
                            <label htmlFor="email">Email:</label><br/>
                            <input type="text" name="email" className="form-control" id="email" {...register("email", {required: true})}/>
                            {errors.email && <span className="validacion1">Requerido...</span>}
                        </div>
                        
                        <div className="eu-pais">
                            <label htmlFor="pais">Pais:</label><br/>
                            <select name="pais" id="pais" className="form-control" {...register("pais_id")} disabled={loadingGeo}>
                                {pais.map((p) =>(
                                    <option key={p.id} value={p.id}>
                                    {p.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="m-f4">
                        <div className="eu-region">
                            <label htmlFor="region">Region:</label><br/>
                            <select name="region" id="region" className="form-control" {...register("region_id")} disabled={loadingGeo || !region.length}>
                                {region.map((r) =>(
                                    <option key={r.id} value={r.id}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="eu-provincia">
                            <label htmlFor="provincia">Provincia:</label><br/>
                            <select name="provincia" id="provincia" className="form-control" {...register("provincia_id")} disabled={loadingGeo || !provincia.length}>
                                {provincia.map((prov) =>(
                                    <option key={prov.id} value={prov.id}>
                                    {prov.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="eu-distrito">
                            <label htmlFor="distrito">Distrito:</label><br/>
                            <select name="distrito" id="distrito" className="form-control" {...register("distrito_id")} disabled={loadingGeo || !distrito.length}>
                                {distrito.map((dist) =>(
                                    <option key={dist.id} value={dist.id}>
                                    {dist.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="m-f5">
                        <div className="eu-direccion">
                            <label htmlFor="direccion">Direccion:</label><br/>
                            <input type="text" name="direccion" className="form-control" id="direccion" {...register("direccion")}/>
                        </div>
                        <div className="eu-celular">
                            <label htmlFor="celular">Celular:</label><br/>
                            <input type="number" name="celular" className="form-control" id="celular" {...register("celular")}/>
                        </div>
                        <div className="eu-nro_emergencia">
                            <label htmlFor="nro_emergencia">N. Emergencia:</label><br/>
                            <input type="number" name="nro_emergencia" className="form-control" id="nro_emergencia" {...register("nro_emergencia")}/>
                        </div>
                    </div>
                    
                    <div className="m-f6">
                        <div className="eu-sexo">
                            <label htmlFor="sexo">Sexo:</label><br/>
                            <select name="sexo" id="sexo" className="form-control" {...register("sexo")}>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>
                        <div className="eu-e_civil">
                            <label htmlFor="e_civil">Estado Civil:</label><br/>
                            <select name="e_civil" id="e_civil" className="form-control" {...register("e_civil")}>
                                <option value="Solter@">Solter@</option>
                                <option value="Casad@">Casad@</option>
                                <option value="Divorciad@">Divorciad@</option>
                                <option value="Viud@">Viud@</option>
                            </select>
                        </div>
                        <div className="eu-t_polo">
                            <label htmlFor="t_polo">T.Polo:</label><br/>
                            <input type="text" name="t_polo" className="form-control" id="t_polo" {...register("t_polo")}/>
                        </div>
                        <div className="eu-t_pantalon">
                            <label htmlFor="t_pantalon">T. Pantalon:</label><br/>
                            <input type="number" name="t_pantalon" className="form-control" id="t_pantalon" {...register("t_pantalon")}/>
                        </div>
                        <div className="eu-t_zapato">
                            <label htmlFor="t_zapato">T. Zapato:</label><br/>
                            <input type="number" name="t_zapato" className="form-control" id="t_zapato" {...register("t_zapato")}/>
                        </div>
                    </div>

                    <div className="m-f7">
                        <div className="eu-cuenta_corriente">
                            <label htmlFor="cuenta_corriente">Cuenta Corriente:</label><br/>
                            <input type="number" name="cuenta_corriente" className="form-control" id="cuenta_corriente" {...register("cuenta_corriente")}/>
                        </div> 
                        <div className="eu-cci">
                            <label htmlFor="cci">CCI:</label><br/>
                            <input type="number" name="cci" className="form-control" id="cci" {...register("cci")}/>
                        </div>
                        <div className="eu-estado">
                            <label htmlFor="estado">Estado:</label><br/>
                            <select name="estado" id="estado" className="form-control" {...register("estado", {required: true})}>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                                <option value="Despedido">Despedido</option>
                            </select>
                        </div>
                    </div>
                    <div className="eu-btn">
                        <button className="edit-btn hover:bg-teal-500" type="button" onClick={handleSubmit2}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button className="cerrar-btn hover:bg-gray-300" onClick={onClose} disabled={isSubmitting}>CERRAR</button> 
                    </div>
                </form>
            </div>
        </div>
    )
}