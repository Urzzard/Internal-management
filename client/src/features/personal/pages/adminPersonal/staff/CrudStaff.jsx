import styles from './CrudStaff.module.css';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { set, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAllStaff, createStaff, updateStaff, deleteStaff, getEligibleUsers, getEligiblePersonal, adminCreateUser } from '../../../api/crud-staff.api';

function CreateUserModal({onClose, onUserCreated}){
    const { register: registerUser, handleSubmit: handleUserSubmit, formState: {errors: userErrors}, reset: resetUserForm } = useForm();

    const onUserSubmit = handleUserSubmit(async (userData) => {
        try{

            const dataToSend = {
                username: userData.username,
                password: userData.password,
                email: userData.email || '',
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
            };

            const response = await adminCreateUser(dataToSend);
            toast.success(`Usuario ${response.data.username} creado.`);
            onUserCreated();
            resetUserForm();
            onClose();
        } catch(error){
            console.error("Error creando usuario", error.response?.data);
            let errorMsg = "Error al crear usuario";

            if(error.response?.data){
                const data = error.response.data;
                if(data.username) errorMsg = `Username: ${data.username[0]}`;
                else if(data.password) errorMsg = `Password: ${data.password[0]}`;
                else if(data.email) errorMsg = `Email: ${data.email[0]}`;
                else if(typeof data === 'object' && Object.keys(data).length > 0){
                    const firstKey = Object.keys(data)[0];
                    errorMsg = `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}`;
                }
            }
            toast.error(errorMsg);
        }
    })

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Crear Nuevo Usuario para Staff</h2>
                <form onSubmit={onUserSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" {...registerUser("username", {required: "Username es requerido"})} />
                        {userErrors.username && <span className={styles.validacion}>{userErrors.username.message}</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" {...registerUser("password", {required: "Password es requerido", minLength:{value:8, message: "Minimo 8 caracteres"}})} />
                        {userErrors.password && <span className={styles.validacion}>{userErrors.password.message}</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="email">Email (Opcional)</label>
                        <input type="email" id="email" {...registerUser("email")} />
                        {userErrors.email && <span className={styles.validacion}>{userErrors.email.message}</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="first_name">Nombre (Opcional)</label>
                        <input type="text" id="first_name" {...registerUser("first_name")} />
                        {userErrors.first_name && <span className={styles.validacion}>{userErrors.first_name.message}</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="last_name">Apellido (Opcional)</label>
                        <input type="text" id="last_name" {...registerUser("last_name")} />
                        {userErrors.last_name && <span className={styles.validacion}>{userErrors.last_name.message}</span>}
                    </div>
                    <div className={styles.modalbtngroup}>
                        <button type='submit' className={styles.saveBtn}>Crear Usuarios</button>
                        <button type='button' className={styles.closeBtn} onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    )

}

function EditStaffModal({staff, onClose, onStaffUpdated}){
    const {register: registerEdit, handleSubmit: handleEditSubmit, formState: {errors: editErrors}, reset: resetEditForm, setValue} = useForm();

    useEffect(() => {
        if(staff){
            setValue("cargo", staff.cargo);
            setValue("rm", staff.rm);
        }
    }, [staff, setValue])

    const onEditSubmit = handleEditSubmit(async (data) => {
        try{

            const dataToUpdate = {
                cargo: data.cargo,
                rm: data.rm
            };
            await updateStaff(staff.id, dataToUpdate);
            toast.success("Asignacion de Staff actualizada.");
            onStaffUpdated();
            resetEditForm();
            onClose();
        } catch(error){
            console.error("Error actualizando staff:", error.response?.data);
            toast.error("Error al actualizar la asignacion.")
        }
    });

    if(!staff) return null;

    return(
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Editar Asignacion de Staff</h2>
                <p>Editando a: <b>{staff.personal?.nombre} {staff.personal?.a_paterno} {staff.personal?.a_materno} ({staff.user?.username})</b></p> <br />
                <form onSubmit={onEditSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="edit_cargo">Cargo del Personal</label>
                        <input type="text" id="edit_cargo"
                            {...registerEdit("cargo", { required: "El cargo es requerido" })}/>
                        {editErrors.cargo && <span className={styles.validacion}>{editErrors.cargo.message}</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="edit_rm">Remuneración Mensual</label>
                        <input type="number" id="edit_rm" step='0.01'
                            {...registerEdit("rm", { required: "La remuneración es requerida", min: { value: 0, message: "Debe ser >= 0" } })} />
                        {editErrors.rm && <span className={styles.validacion}>{editErrors.rm.message}</span>}
                    </div>
                    <div className={styles.modalbtngroup}>
                        <button type="submit" className={styles.saveBtn}>Guardar Cambios</button>
                        <button type="button" className={styles.closeBtn} onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function CrudStaff(){

    const navigate = useNavigate()
    const [staffList, setStaffList] = useState([])
    const [eligiblePersonal, setEligiblePersonal] = useState([])
    const [eligibleUsers, setEligibleUsers] = useState([])
    const [loading, setLoading] = useState(true);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const {
        register,
        handleSubmit,
        formState:{errors},
        reset
    } = useForm()

    const loadData = async () => {
        setLoading(true);
        try{
            
            const [staffRes, personalRes, userRes] = await Promise.all([
                getAllStaff(),
                getEligiblePersonal(),
                getEligibleUsers(),
                
            ]);
            setStaffList(staffRes.data)
            setEligiblePersonal(personalRes.data)
            setEligibleUsers(userRes.data)
            /* console.log(staffRes.data) */
        }catch(error){
            console.error("Error al cargar la informacion:", error)
            if(error.response?.status === 401 || error.response?.status === 403){
                toast.error("No tienes permisos o tu sesión expiró aqui");
                navigate('/login')
            } else {
                toast.error("Error cargando datos iniciales")
            }
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [navigate]);


    const refreshEligibleUsers = async () => {
        try{
            const userRes = await getEligibleUsers();
            setEligibleUsers(userRes.data);
        } catch(error){
            console.error("Error refrescando usuarios elegibles:", error);
            toast.error("No se pudo actualizar la lista de usuarios.");
        }
    }


    const onSubmit = handleSubmit(async (data) => {
        try{
            const staffData = {
                personal_id: parseInt(data.personal_id, 10),
                user_id: parseInt(data.user_id, 10),
                cargo: data.cargo,
                rm: data.rm
            };

            /* console.log(staffData) */

            await createStaff(staffData);
            toast.success("Staff asignado correctamente");
            reset();
            loadData();

        }catch(error){
            console.error("Error detallado:", error.response?.data);
            let errorMsg = "Error al registrar Staff.";
            if(error.response?.data){
                const responseData = error.response.data;
                if(responseData.user_id) errorMsg = `Usuario: ${responseData.user_id[0]}`;
                else if(responseData.personal_id) errorMsg = `Personal: ${responseData.personal[0]}`
                else if(responseData.detail) errorMsg = responseData.detail;
                else if(typeof responseData === 'object' && Object.keys(responseData).length > 0){
                    const firstKey = Object.keys(responseData)[0];
                    const message = Array.isArray(responseData[firstKey]) ? responseData[firstKey][0] : responseData[firstKey];
                    errorMsg = `${firstKey}: ${message}`
                }
            }

            toast.error(errorMsg)
        }
    })

    const handleEditClick = (staffMember) => {
        setEditingStaff(staffMember);
    }

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


    const sortedStaff = [...staffList].sort((a,b) => {

        let aValue, bValue;

        const getValue = (obj, path) => path.split('.').reduce((o,k) => (o || {}) [k], obj)

        aValue = getValue(a,sortColumn);
        bValue = getValue(b, sortColumn);

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

    return(
        <BaseLayout breadcrumbs={[
            {label: 'INICIO', path: '/inicio'},
            {label: 'PERSONAL', path: '/personal'},
            {label: 'ADMINISTRACION DEL PERSONAL', path: '/admin-personal'},
            {label: 'ADMINISTRACION DE STAFF', path: '/crud-staff'}
        ]}>
            {showCreateUserModal && <CreateUserModal onClose={() => setShowCreateUserModal(false)} onUserCreated={() => {refreshEligibleUsers()}}/>}
            {editingStaff && <EditStaffModal staff={editingStaff} onClose={() => setEditingStaff(null)} onStaffUpdated={() => {loadData(); setEditingStaff(null);}}/>}

            <div className={styles.staffregister}>
                <h3>
                    REGISTRO DE PERSONAL TÉCNICO O STAFF
                </h3>

                <form onSubmit={onSubmit}>
                    <div className={styles.formgroup}>
                        <label htmlFor="personal_id">Personal</label>
                        <select name="personal_id" id="personal_id" {...register("personal_id", {required: "Seleccione un personal"})}>
                            <option value="">Seleccione...</option>
                            {eligiblePersonal.map(p =>(
                                <option key={p.id} value={p.id}>{p.nombre} {p.a_paterno} {p.a_materno} || DNI: {p.dni}</option>
                            ))}
                        </select>
                        {errors.personal_id && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="user_id">Cuenta de usuario del sistema</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', justifyContent:'space-evenly', width:'100%'}}>
                            <select name="user_id" id="user_id" {...register("user_id", {required: "Seleccione una cuenta de usuario"})} style={{flexGrow:1}}>
                                <option value="">Seleccione...</option>
                                {eligibleUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                            <button type='button' onClick={() => setShowCreateUserModal(true)} className={styles.btncrearusuario} title='Crear nuevo usuario para staff'>
                                Crear Usuario
                            </button>
                        </div>
                        {errors.user_id && <span className={styles.validacion}>{errors.user_id.message}</span>}
                        {eligibleUsers.length === 0 && !loading && <span className={styles.info}>No hay usuarios elegibles disponibles. Puede crear uno nuevo.</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="cargo">Cargo del Personal</label>
                        <input type="text" name='cargo' id='cargo'
                        {...register("cargo",{required: "El campo es requerido"})}/>
                        {errors.cargo && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="rm">Remuneracion Mensual</label>
                        <input type="number" name='rm' id='rm' step='0.01' {...register("rm",{required: "La remuneracion es requerida", min:{ value:0, message: "Debe ser mayor o igual a 0"}})} />
                        {errors.rm && <span className={styles.validacion}>Este campo es requerido..!</span>}
                    </div>

                    <div className={`${styles.formgroup} btn-guardar`}>
                        <button type='submit' className={styles.btnguardar}>{loading ? 'Cargando...' : 'Asignar Staff'}</button>
                    </div>
                </form>
            </div>

            <div className={styles.stafflist}>
                <h3 className={styles.stafflisttitle}>
                    LISTA DE PERSONAL TÉCNICO O STAFF
                </h3>
                {loading ? <p>Cargando lista de staff...</p>: (
                    <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('personal.nombre')}>PERSONAL {sortColumn === 'personal.nombre' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('cargo')}>CARGO {sortColumn === 'cargo' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('user.username')}>USUARIO {sortColumn === 'user.username' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('rm')}>REMUNERACIÓN {sortColumn === 'rm' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            
                            {sortedStaff.map(s => (
                                <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-2 px-4">{s.id}</td>
                                    <td className="py-2 px-4">{s.personal?.nombre} {s.personal?.a_paterno}</td>
                                    <td className="py-2 px-4">{s.cargo}</td>
                                    <td className="py-2 px-4">{s.user?.username}</td>
                                    <td className="py-2 px-4">S/. {parseFloat(s.rm).toFixed(2)}</td>
                                    <td className={styles.btnListGroup}>
                                        <button 
                                            onClick={() => handleEditClick(s)}
                                            className={styles.btnEdit}
                                            title='Editar Cargo y Remuneración'
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (window.confirm(`¿Eliminar la asignación de staff para ${s.user?.username}? \n\n Esto NO elimina al usuario (${s.user?.username}) ni al personal (${s.personal?.nombre} ${s.personal?.a_paterno}), solo quita el rol de Staff.`)) {
                                                    try {
                                                        await deleteStaff(s.id);
                                                        toast.success('Asignación de Staff eliminada');
                                                        loadData();
                                                    } catch (delError) {
                                                        console.error("Error eliminando staff:", delError);
                                                        toast.error("No se pudo eliminar la asignación.");
                                                    }
                                                }
                                            }}
                                            className={styles.btnDelete}
                                            title='Eliminar solo la asignacion de rol Staff'
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sortedStaff.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className='text-center py-4'>No hay personal asignado como Staff</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </BaseLayout>
    )

}