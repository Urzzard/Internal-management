import styles from './CrudStaff.module.css';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {getAllPers} from '../../../api/crud-personal.api'
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../../api/crud-staff.api';
import { useAuth } from '../../../../../context/AuthContext';

export function CrudStaff(){

    const {user: currentUser} = useAuth()
    const navigate = useNavigate()
    const [staff, setStaff] = useState([])
    const [personal, setPersonal] = useState([])

    useEffect(() => {
        async function loadData() {
            try{
                const [stafRes, personalRes] = await Promise.all([
                    getAllStaff(),
                    getAllPers()
                ]);
                setStaff(stafRes.data)
                setPersonal(personalRes.data)
            }catch(error){
                console.error("Error al cargar la informacion:", error)
                if(error.response?.status === 401){
                    navigate('/login')
                }
            }
        }
        loadData();
    }, [navigate]);

    /* useEffect(() => {
        async function loadStaff() {
            const res = await getAllStaff();
            setStaff(res.data);
        }
        loadStaff();
    }, [])


    useEffect(() => {
        async function loadPersonal(){
            const res = await getAllU();
            setPersonal(res.data);
        }
        loadPersonal()
    }, []) */

    const {
        register,
        handleSubmit,
        formState:{errors},
        reset
    } = useForm()

    const onSubmit = handleSubmit(async (data) => {
        try{
            const staffData = {
                usuario_id: parseInt(data.usuario_id),
                cargo: data.cargo,
                rm: data.rm,
                user: {
                    username: data.username,
                    password: data.password
                }
            };

            console.log("Datos a enviar", staffData)

            const response = await createStaff(staffData)
            toast.success("Staff registrado correctamente") 

            const updatedStaff = await getAllStaff();
            setStaff(updatedStaff.data);
            reset();

            /* await createStaff(data)
            toast.success("Staff registrado correctamente")
            setTimeout(() => {
                navigate(0)
            }, 800) */
        }catch(error){
            console.error("Error detallado:", error.response?.data);
            if (error.response?.data?.usuario) {
                toast.error(error.response.data.usuario[0]);
            } else {
                toast.error(error.response?.data?.detail || "Error al registrar staff");
            }
        }
    })

    const [selected, setSelected] = useState(null);

    const handleSelectedClick = staff => {
        setSelected(staff)
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


    const sortedStaff = [...staff].sort((a,b) => {
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
            {label: 'ADMINISTRACION DE STAFF', path: '/crud-staff'}
        ]}>

            <div className={styles.staffregister}>
                <h3>
                    REGISTRO DE PERSONAL TÉCNICO O STAFF
                </h3>

                <form onSubmit={onSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="usuario_id">Personal</label>
                        <select name="usuario_id" id="usuario_id" {...register("usuario_id", {required: "Seleccione un personal"})}>
                            <option value="">Seleccione...</option>
                            {personal.map(p =>(
                                <option key={p.id} value={p.id}>{p.nombre} {p.a_paterno} {p.a_materno}</option>
                            ))}
                        </select>
                        {errors.usuario_id && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="cargo">Cargo del Personal</label>
                        <input type="text" name='cargo' id='cargo'
                        {...register("cargo",{required: "El campo es requerido"})}/>
                        {errors.cargo && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="username">Nombre de Usuario</label>
                        <input type="text" name='username' id='username' {...register("username", { required: "El nombre de usuario es requerido", pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Solo letras, números y _"}})}/>
                        {errors.username && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name='password' id='password' {...register("password", { required: "La contraseña es requerida", minLength: { value: 8, message: "Minimo 8 caracteres"}})}/>
                        {errors.password && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="rm">Remuneracion Mensual</label>
                        <input type="number" name='rm' id='rm' step='0.01' {...register("rm",{required: "La remuneracion es requerida", min:{ value:0, message: "Debe ser mayot a 0"}})} />
                        {errors.rm && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>

                    <div className={`${styles.formgroup} btn-guardar`}>
                        <button className={styles.btnguardar}>Guardar</button>
                    </div>
                </form>
            </div>
            <div className={styles.stafflist}>
                <h3 className={styles.stafflisttitle}>
                    LISTA DE PERSONAL TÉCNICO O STAFF
                </h3>
                <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('usuario__nombre')}>PERSONAL {sortColumn === 'usuario__nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('cargo')}>CARGO {sortColumn === 'cargo' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('username')}>USUARIO {sortColumn === 'username' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('rm')}>REMUNERACIÓN {sortColumn === 'rm' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                        {sortedStaff.map(s => (
                            <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-2 px-4">{s.id}</td>
                                <td className="py-2 px-4">{s.personal.nombre} {s.personal.a_paterno}</td>
                                <td className="py-2 px-4">{s.cargo}</td>
                                <td className="py-2 px-4">{s.username}</td>
                                <td className="py-2 px-4">S/. {parseFloat(s.rm).toFixed(2)}</td>
                                <td className="py-2 px-4 flex gap-2">
                                    <button 
                                        onClick={() => handleSelectedClick(s)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (window.confirm('¿Eliminar este staff?')) {
                                                await deleteStaff(s.id);
                                                toast.success('Staff eliminado');
                                                navigate(0);
                                            }
                                        }}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>

                </table>
            </div>
        </BaseLayout>
    )

}