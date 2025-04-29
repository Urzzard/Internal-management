import React, {useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BaseLayout } from "../../../../../components/layout/BaseLayout";
import styles from "./CrudUsers.module.css"
import modalStyles from "../staff/CrudStaff.module.css"
import { getAllManagedUsers, updateManagedUser, deactivateManagedUser, reactivateManagedUser } from "../../../api/crud-users.api";
import { useNavigate } from "react-router-dom";


function EditUserModal({ user, onClose, onUserUpdated }) {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

    useEffect(() => {
        if (user) {
            setValue("username", user.username);
            setValue("email", user.email || '');
            setValue("first_name", user.first_name || '');
            setValue("last_name", user.last_name || '');
        }
    }, [user, setValue]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            const dataToUpdate = {
                username: data.username,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
            };
            await updateManagedUser(user.id, dataToUpdate);
            toast.success(`Usuario ${data.username} actualizado.`);
            onUserUpdated();
            reset();
            onClose();
        } catch (error) {
            console.error("Error actualizando usuario:", error.response?.data);
             let errorMsg = "Error al actualizar usuario.";
             if (error.response?.data?.username) {
                 errorMsg = `Username: ${error.response.data.username[0]}`;
             } else if (error.response?.data?.email) {
                 errorMsg = `Email: ${error.response.data.email[0]}`;
             }
            toast.error(errorMsg);
        }
    });

    if (!user) return null;

    return (
        <div className={modalStyles.modal}>
            <div className={modalStyles.modalContent}>
                <h2>Editando usuario: {user.username}</h2>
                <form onSubmit={onSubmit}>
                    <div className={modalStyles.formgroup}>
                        <label htmlFor="edit_username">Username</label>
                        <input type="text" id="edit_username" {...register("username", { required: "Username requerido" })} />
                        {errors.username && <span className={modalStyles.validacion}>{errors.username.message}</span>}
                    </div>
                    <div className={modalStyles.formgroup}>
                        <label htmlFor="edit_email">Email</label>
                        <input type="email" id="edit_email" {...register("email")} />
                        {errors.email && <span className={modalStyles.validacion}>{errors.email.message}</span>}
                    </div>
                    <div className={modalStyles.formgroup}>
                        <label htmlFor="edit_first_name">Nombre</label>
                        <input type="text" id="edit_first_name" {...register("first_name")} />
                    </div>
                     <div className={modalStyles.formgroup}>
                        <label htmlFor="edit_last_name">Apellidos</label>
                        <input type="text" id="edit_last_name" {...register("last_name")} />
                    </div>
                    <div className={modalStyles.modalbtngroup}>
                        <button type="submit" className={modalStyles.saveBtn}>Guardar Cambios</button>
                        <button type="button" className={modalStyles.closeBtn} onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}



export function CrudUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const navigate = useNavigate();

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await getAllManagedUsers();
            setUsers(res.data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            toast.error("No se pudo cargar la lista de usuarios.");
             if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [navigate]);


    const handleDeactivate = async (user) => {
        if (window.confirm(`¿Está seguro de DESACTIVAR al usuario ${user.username}? \n\nEl usuario no podrá iniciar sesión. Si estaba asignado como Staff, esa asignación también se eliminará.`)) {
            try {
                await deactivateManagedUser(user.id);
                toast.success(`Usuario ${user.username} desactivado.`);
                loadUsers();
            } catch (error) {
                console.error("Error desactivando usuario:", error);
                toast.error("No se pudo desactivar el usuario.");
            }
        }
    };


    const handleReactivate = async (user) => {
         if (window.confirm(`¿Está seguro de REACTIVAR al usuario ${user.username}? \n\nEl usuario podrá volver a iniciar sesión.`)) {
            try {
                await reactivateManagedUser(user.id);
                // una opcion para variar: await updateManagedUser(user.id, { is_active: true });
                toast.success(`Usuario ${user.username} reactivado.`);
                loadUsers();
            } catch (error) {
                console.error("Error reactivando usuario:", error);
                toast.error("No se pudo reactivar el usuario.");
            }
        }
    };

    const [sortColumn, setSortColumn] = useState('id');
    const [sortDir, setSortDir] = useState('asc');

    const handleSort = (column) => {

        if (sortColumn === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDir('asc');
        }
    };

     const sortedUsers = [...users].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];


        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {

             if (aValue === bValue) return 0;
             if (sortDir === 'asc') return aValue ? 1 : -1; 
             else return aValue ? -1 : 1;
        }


         if (['date_joined', 'last_login'].includes(sortColumn)) {
            const dateA = aValue ? new Date(aValue) : null;
            const dateB = bValue ? new Date(bValue) : null;

            if (dateA === dateB) return 0;
            if (!dateA) return sortDir === 'asc' ? -1 : 1;
            if (!dateB) return sortDir === 'asc' ? 1 : -1;

            const diff = dateA.getTime() - dateB.getTime();

            return sortDir === 'asc' ? diff : -diff;
        }

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


    return (
        <BaseLayout breadcrumbs={[
            { label: 'INICIO', path: '/inicio' },
            { label: 'PERSONAL', path: '/personal' },
            { label: 'ADMINISTRACION DEL PERSONAL', path: '/admin-personal' },
            { label: 'GESTIÓN DE USUARIOS', path: '/admin-users' }
        ]}>


             {editingUser && <EditUserModal
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onUserUpdated={() => {
                    loadUsers();
                    setEditingUser(null);
                }}
             />}

            <div className={styles.userListContainer}>
                <h3 className={styles.userListTittle}>GESTIÓN DE USUARIOS</h3>

                 {loading ? <p>Cargando usuarios...</p> : (
                    <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {sortColumn === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('username')}>Username {sortColumn === 'username' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('email')}>Email {sortColumn === 'email' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('first_name')}>Nombre {sortColumn === 'first_name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('last_name')}>Apellidos {sortColumn === 'last_name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('is_active')}>Estado {sortColumn === 'is_active' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSort('date_joined')}>Fecha Registro {sortColumn === 'date_joined' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map(user => (
                                <tr key={user.id} className={`border-b hover:bg-gray-50 ${!user.is_active ? styles.inactiveRow : ''}`}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email || '-'}</td>
                                    <td>{user.first_name || '-'}</td>
                                    <td>{user.last_name || '-'}</td>
                                    <td>
                                        <span className={user.is_active ? styles.activeStatus : styles.inactiveStatus}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                                    <td className={styles.btnListGroup}>
                                        <button onClick={() => setEditingUser(user)} className={styles.btnEdit} title="Editar detalles del usuario">
                                            Editar
                                        </button>
                                        {user.is_active ? (
                                            <button onClick={() => handleDeactivate(user)} className={styles.btnDelete} title="Desactivar cuenta (no podrá loguearse)">
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button onClick={() => handleReactivate(user)} className={styles.btnReactiv} title="Reactivar cuenta">
                                                Reactivar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sortedUsers.length === 0 && !loading && (
                                <tr><td colSpan="8" className="text-center py-4">No hay usuarios staff para mostrar.</td></tr>
                            )}
                        </tbody>
                    </table>
                 )}
            </div>
        </BaseLayout>
    );
}