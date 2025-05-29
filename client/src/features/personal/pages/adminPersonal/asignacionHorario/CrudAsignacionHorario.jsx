import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import {
    getAllAsignacionesHorario, createAsignacionHorario,
    updateAsignacionHorario, deleteAsignacionHorario
} from '../../../api/crud-asignaciones.api';
import { getAllPers } from '../../../api/crud-personal.api';
import { getAllHorariosTrabajo } from '../../../api/crud-horarios.api'; 
import styles from './CrudAsignacionHorario.module.css'; 

function AsignacionHorarioForm({ asignacion, personalList, horarioList, onFormSubmit, onCancel, isLoading }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: asignacion || {
            personal_id: '',
            horario_trabajo_id: '',
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            activo: true
        }
    });

    useEffect(() => {
        if (asignacion) {
            reset({
                ...asignacion,
                personal_id: asignacion.personal_info?.id || asignacion.personal_id || '',
                horario_trabajo_id: asignacion.horario_trabajo_info?.id || asignacion.horario_trabajo_id || '',
                fecha_fin: asignacion.fecha_fin || ''
            });
        } else {
             reset({
                personal_id: '', horario_trabajo_id: '',
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: '', activo: true
            });
        }
    }, [asignacion, reset]);

    const onSubmit = (data) => {
        const payload = {
            ...data,
            personal_id: parseInt(data.personal_id),
            horario_trabajo_id: parseInt(data.horario_trabajo_id),
            fecha_fin: data.fecha_fin === '' ? null : data.fecha_fin
        };
        onFormSubmit(payload);
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h3>{asignacion ? 'Editar Asignación de Horario' : 'Nueva Asignación de Horario'}</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.formGroup}>
                        <label htmlFor="personal_id">Personal *</label>
                        <select id="personal_id" {...register("personal_id", { required: "Personal es requerido" })}
                                disabled={!!asignacion}>
                            <option value="">Seleccione Personal...</option>
                            {personalList.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.a_paterno} {p.a_materno}, {p.nombre} ({p.dni})
                                </option>
                            ))}
                        </select>
                        {errors.personal_id && <span className={styles.errorText}>{errors.personal_id.message}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="horario_trabajo_id">Horario de Trabajo *</label>
                        <select id="horario_trabajo_id" {...register("horario_trabajo_id", { required: "Horario es requerido" })}>
                            <option value="">Seleccione Horario...</option>
                            {horarioList.map(h => (
                                <option key={h.id} value={h.id} disabled={!h.activo}>
                                    {h.nombre} {h.activo ? '' : '(Inactivo)'}
                                </option>
                            ))}
                        </select>
                        {errors.horario_trabajo_id && <span className={styles.errorText}>{errors.horario_trabajo_id.message}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="fecha_inicio">Fecha Inicio *</label>
                        <input type="date" id="fecha_inicio" {...register("fecha_inicio", { required: "Fecha de inicio es requerida" })} />
                        {errors.fecha_inicio && <span className={styles.errorText}>{errors.fecha_inicio.message}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="fecha_fin">Fecha Fin (Opcional)</label>
                        <input type="date" id="fecha_fin" {...register("fecha_fin")} />
                    </div>
                    <div className={styles.formGroupCheckbox}>
                        <input type="checkbox" id="activo" {...register("activo")} />
                        <label htmlFor="activo">Asignación Activa</label>
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" disabled={isLoading} className={styles.saveButton}>
                            {isLoading ? 'Guardando...' : (asignacion ? 'Actualizar' : 'Crear Asignación')}
                        </button>
                        <button type="button" onClick={onCancel} disabled={isLoading} className={styles.cancelButton}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


export function CrudAsignacionHorario() {
    const [asignaciones, setAsignaciones] = useState([]);
    const [personalList, setPersonalList] = useState([]);
    const [horarioList, setHorarioList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingAsignacion, setEditingAsignacion] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [asignacionesRes, personalRes, horariosRes] = await Promise.all([
                getAllAsignacionesHorario(),
                getAllPers(),
                getAllHorariosTrabajo()
            ]);
            setAsignaciones(asignacionesRes.data.results || asignacionesRes.data);
            setPersonalList(personalRes.data.results || personalRes.data);
            setHorarioList(horariosRes.data.results || horariosRes.data);
        } catch (error) {
            toast.error("Error al cargar datos iniciales.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (editingAsignacion) {
                await updateAsignacionHorario(editingAsignacion.id, data);
                toast.success("Asignación actualizada.");
            } else {
                await createAsignacionHorario(data);
                toast.success("Asignación creada.");
            }
            setShowForm(false);
            setEditingAsignacion(null);
            fetchData();
        } catch (error) {
            console.error("Error guardando asignación:", error.response?.data || error);
             const errorData = error.response?.data;
             if (errorData && typeof errorData === 'object') {
                 let messages = [];
                 if (errorData.personal_id) messages.push(`Personal: ${errorData.personal_id.join(', ')}`);
                 if (errorData.horario_trabajo_id) messages.push(`Horario: ${errorData.horario_trabajo_id.join(', ')}`);
                 if (errorData.fecha_inicio) messages.push(`Fecha Inicio: ${errorData.fecha_inicio.join(', ')}`);
                 if (errorData.non_field_errors) messages.push(errorData.non_field_errors.join(', '));
                 if (messages.length > 0) toast.error(messages.join('\n'));
                 else toast.error("Error al guardar. Verifique los datos.");
             } else if (errorData && typeof errorData === 'string') {
                 toast.error(errorData);
             }
             else {
                 toast.error("Error al guardar la asignación.");
             }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (asignacion) => {
        setEditingAsignacion(asignacion);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Está seguro de eliminar esta asignación de horario?")) {
            setIsLoading(true);
            try {
                await deleteAsignacionHorario(id);
                toast.success("Asignación eliminada.");
                fetchData();
            } catch (error) {
                toast.error("Error al eliminar asignación.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const openCreateForm = () => {
        setEditingAsignacion(null);
        setShowForm(true);
    };

    return (
        <BaseLayout breadcrumbs={[
            { label: 'INICIO', path: '/inicio' },
            { label: 'PERSONAL', path: '/personal'},
            { label: 'ADMINISTRACION DE PERSONAL', path: '/admin-personal'},
            { label: 'ASIGNACION DE HORARIOS', path: '/asignacion-horario' }]}>
            <div className={styles.crudContainer}>
                <h2>Asignación de Horarios al Personal</h2>
                <button onClick={openCreateForm} className={styles.createButton}>
                    + Nueva Asignación
                </button>

                {showForm && (
                    <AsignacionHorarioForm
                        asignacion={editingAsignacion}
                        personalList={personalList}
                        horarioList={horarioList}
                        onFormSubmit={handleFormSubmit}
                        onCancel={() => { setShowForm(false); setEditingAsignacion(null); }}
                        isLoading={isLoading}
                    />
                )}

                {isLoading && !showForm && <p>Cargando asignaciones...</p>}
                {!isLoading && !showForm && asignaciones.length === 0 && <p>No hay asignaciones de horario creadas.</p>}
                {!isLoading && !showForm && asignaciones.length > 0 && (
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Personal</th>
                                <th>DNI</th>
                                <th>Horario Asignado</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Activo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignaciones.map(asig => (
                                <tr key={asig.id}>
                                    <td>{asig.personal_info?.a_paterno} {asig.personal_info?.a_materno}, {asig.personal_info?.nombre}</td>
                                    <td>{asig.personal_info?.dni}</td>
                                    <td>{asig.horario_trabajo_info?.nombre}</td>
                                    <td>{new Date(asig.fecha_inicio + 'T00:00:00').toLocaleDateString()}</td> {/* Ajustar para zona horaria */}
                                    <td>{asig.fecha_fin ? new Date(asig.fecha_fin + 'T00:00:00').toLocaleDateString() : 'Indefinido'}</td>
                                    <td>{asig.activo ? 'Sí' : 'No'}</td>
                                    <td>
                                        <button onClick={() => handleEdit(asig)} className={styles.editButton}>Editar</button>
                                        <button onClick={() => handleDelete(asig.id)} className={styles.deleteButton}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </BaseLayout>
    );
}