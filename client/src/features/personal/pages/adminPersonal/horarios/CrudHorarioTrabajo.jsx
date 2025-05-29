import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BaseLayout } from '../../../../../components/layout/BaseLayout';
import {
    getAllHorariosTrabajo, createHorarioTrabajo,
    updateHorarioTrabajo, deleteHorarioTrabajo
} from '../../../api/crud-horarios.api';
import styles from './CrudHorarioTrabajo.module.css';

const DIA_SEMANA_CHOICES = [
    { value: 0, label: 'Lunes' }, { value: 1, label: 'Martes' },
    { value: 2, label: 'Miércoles' }, { value: 3, label: 'Jueves' },
    { value: 4, label: 'Viernes' }, { value: 5, label: 'Sábado' },
    { value: 6, label: 'Domingo' },
];

function HorarioTrabajoForm({horario, onFormSubmit, onCancel, isLoading}){
    const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: horario || {
            nombre: '',
            descripcion: '',
            hs_dominical: '48.00',
            activo: true,
            detalles_dias: []
        }
    });

    useEffect(() => {
        if (horario) {
            reset({
                ...horario,

                detalles_dias: horario.detalles_dias ? horario.detalles_dias.map(d => ({
                    ...d,
                    hora_entrada_teorica: d.hora_entrada_teorica?.substring(0,5) || '', // "HH:MM"
                    hora_inicio_tolerancia_entrada: d.hora_inicio_tolerancia_entrada?.substring(0,5) || '',
                    hora_fin_tolerancia_entrada: d.hora_fin_tolerancia_entrada?.substring(0,5) || '',
                    hora_inicio_descanso_teorica: d.hora_inicio_descanso_teorica?.substring(0,5) || '',
                    hora_fin_descanso_teorica: d.hora_fin_descanso_teorica?.substring(0,5) || '',
                    hora_salida_teorica: d.hora_salida_teorica?.substring(0,5) || '',
                })) : []
            });
        } else {
             reset({
                nombre: '', descripcion: '', hs_dominical: '48.00', activo: true, detalles_dias: []
            });
        }
    }, [horario, reset]);

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "detalles_dias"
    });

    const onSubmit = (data) => {
        const processedData = {
            ...data,
            detalles_dias: data.detalles_dias.map(d => ({
                ...d,
            }))
        };
        onFormSubmit(processedData);
    };

    const diasSemanaUsados = watch('detalles_dias', []).map(d => d.dia_semana?.toString());

    return(
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h3>{horario ? 'Editar Horario de Trabajo' : 'Crear Nuevo Horario'}</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.formGroup}>
                        <label htmlFor="nombre">Nombre del Horario *</label>
                        <input id="nombre" {...register("nombre", { required: "Nombre es requerido" })} />
                        {errors.nombre && <span className={styles.errorText}>{errors.nombre.message}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea id="descripcion" {...register("descripcion")} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="hs_dominical">Horas Semanales para Dominical *</label>
                        <input type="number" id="hs_dominical" step="0.01" {...register("hs_dominical", { required: "Horas para dominical son requeridas", valueAsNumber: true, min: {value: 0, message: "Debe ser positivo"} })} />
                        {errors.hs_dominical && <span className={styles.errorText}>{errors.hs_dominical.message}</span>}
                    </div>
                    <div className={styles.formGroupCheckbox}>
                        <input type="checkbox" id="activo" {...register("activo")} />
                        <label htmlFor="activo">Activo</label>
                    </div>
                    <h4>Detalles de Días del Horario:</h4>
                    {fields.map((item, index) => (
                        <div key={item.id} className={styles.detalleDiaItem}>
                            <h5>Día {index + 1}</h5>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Día Semana *</label>
                                    <select {...register(`detalles_dias.${index}.dia_semana`, { required: true, valueAsNumber: true })}>
                                        <option value="">Seleccione...</option>
                                        {DIA_SEMANA_CHOICES.map(d => (
                                            <option key={d.value} value={d.value} disabled={diasSemanaUsados.includes(d.value.toString()) && item.dia_semana?.toString() !== d.value.toString()}>
                                                {d.label}
                                            </option>
                                        ))}
                                    </select>
                                     {errors.detalles_dias?.[index]?.dia_semana && <span className={styles.errorText}>Requerido</span>}
                                </div>
                                <div className={styles.formGroupCheckboxSmall}>
                                    <input type="checkbox" {...register(`detalles_dias.${index}.es_laborable`)} />
                                    <label>Es Laborable</label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Entrada Teórica *</label>
                                    <input type="time" {...register(`detalles_dias.${index}.hora_entrada_teorica`, { required: "Requerido" })} step="1"/>
                                     {errors.detalles_dias?.[index]?.hora_entrada_teorica && <span className={styles.errorText}>Requerido</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Fin Tolerancia Entrada</label>
                                    <input type="time" {...register(`detalles_dias.${index}.hora_fin_tolerancia_entrada`)} step="1"/>
                                </div>
                                 <div className={styles.formGroup}>
                                    <label>Inicio Descanso</label>
                                    <input type="time" {...register(`detalles_dias.${index}.hora_inicio_descanso_teorica`)} step="1"/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Fin Descanso</label>
                                    <input type="time" {...register(`detalles_dias.${index}.hora_fin_descanso_teorica`)} step="1"/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Duración Descanso (min) *</label>
                                    <input type="number" {...register(`detalles_dias.${index}.duracion_descanso_minutos_teorica`, { required: true, valueAsNumber: true, min:0 })} />
                                     {errors.detalles_dias?.[index]?.duracion_descanso_minutos_teorica && <span className={styles.errorText}>Requerido</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Salida Teórica *</label>
                                    <input type="time" {...register(`detalles_dias.${index}.hora_salida_teorica`, { required: "Requerido" })} step="1"/>
                                     {errors.detalles_dias?.[index]?.hora_salida_teorica && <span className={styles.errorText}>Requerido</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Horas Jornada Teórica *</label>
                                    <input type="number" step="0.01" {...register(`detalles_dias.${index}.horas_jornada_teorica`, { required: true, valueAsNumber: true, min:0 })} />
                                     {errors.detalles_dias?.[index]?.horas_jornada_teorica && <span className={styles.errorText}>Requerido</span>}
                                </div>
                            </div>
                            <button type="button" onClick={() => remove(index)} className={styles.removeButtonSmall}>Eliminar Día</button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => append({
                            dia_semana: '', es_laborable: true, hora_entrada_teorica: '07:30',
                            hora_fin_tolerancia_entrada: '07:30',
                            hora_inicio_descanso_teorica: '12:00', hora_fin_descanso_teorica: '13:30',
                            duracion_descanso_minutos_teorica: 90, hora_salida_teorica: '17:30',
                            horas_jornada_teorica: '8.50'
                        })}
                        className={styles.addButton}
                        disabled={fields.length >= 7}
                    >
                        + Añadir Detalle de Día
                    </button>
                    <div className={styles.formActions}>
                        <button type="submit" disabled={isLoading} className={styles.saveButton}>
                            {isLoading ? 'Guardando...' : (horario ? 'Actualizar Horario' : 'Crear Horario')}
                        </button>
                        <button type="button" onClick={onCancel} disabled={isLoading} className={styles.cancelButton}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function CrudHorarioTrabajo(){
    const [horarios, setHorarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingHorario, setEditingHorario] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchHorarios = async () => {
        setIsLoading(true);
        try {
            const response = await getAllHorariosTrabajo();
            setHorarios(response.data.results || response.data);
        } catch (error) {
            toast.error("Error al cargar horarios.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHorarios();
    }, []);

    const handleFormSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (editingHorario) {
                await updateHorarioTrabajo(editingHorario.id, data);
                toast.success("Horario actualizado correctamente.");
            } else {
                await createHorarioTrabajo(data);
                toast.success("Horario creado correctamente.");
            }
            setShowForm(false);
            setEditingHorario(null);
            fetchHorarios();
        } catch (error) {
            console.error("Error guardando horario:", error.response?.data || error);
            const errorData = error.response?.data;
            if (errorData) {
                let messages = [];
                if (errorData.nombre) messages.push(`Nombre: ${errorData.nombre.join(', ')}`);
                if (errorData.detalles_dias) messages.push("Error en detalles de días. Revise los datos.");
                if (messages.length > 0) toast.error(messages.join('\n'));
                else toast.error("Error al guardar el horario. Verifique los datos.");
            } else {
                toast.error("Error al guardar el horario.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (horario) => {
        setEditingHorario(horario);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Está seguro de eliminar este horario? Esto podría afectar asignaciones existentes.")) {
            setIsLoading(true);
            try {
                await deleteHorarioTrabajo(id);
                toast.success("Horario eliminado.");
                fetchHorarios();
            } catch (error) {
                toast.error("Error al eliminar horario. Puede estar en uso.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const openCreateForm = () => {
        setEditingHorario(null);
        setShowForm(true);
    };

    return(
        <BaseLayout breadcrumbs={[
            { label: 'INICIO', path: '/inicio' },
            { label: 'PERSONAL', path: '/personal'},
            { label: 'ADMINISTRACION DE PERSONAL', path: '/admin-personal'},
            { label: 'GESTION DE HORARIOS', path: '/horario-trabajo' }]}>
            <div className={styles.crudContainer}>
                <h2>Gestión de Horarios de Trabajo</h2>
                <button onClick={openCreateForm} className={styles.createButton}>
                    + Crear Nuevo Horario
                </button>

                {showForm && (
                    <HorarioTrabajoForm
                        horario={editingHorario}
                        onFormSubmit={handleFormSubmit}
                        onCancel={() => { setShowForm(false); setEditingHorario(null); }}
                        isLoading={isLoading}
                    />
                )}

                {isLoading && !showForm && <p>Cargando horarios...</p>}
                {!isLoading && !showForm && horarios.length === 0 && <p>No hay horarios creados.</p>}
                {!isLoading && !showForm && horarios.length > 0 && (
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Hrs. Dominical</th>
                                <th>Activo</th>
                                <th>Días Definidos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horarios.map(h => (
                                <tr key={h.id}>
                                    <td>{h.nombre}</td>
                                    <td>{h.descripcion?.substring(0, 50)}{h.descripcion?.length > 50 ? '...' : ''}</td>
                                    <td>{h.hs_dominical}</td>
                                    <td>{h.activo ? 'Sí' : 'No'}</td>
                                    <td>{h.detalles_dias?.length || 0}</td>
                                    <td>
                                        <button onClick={() => handleEdit(h)} className={styles.editButton}>Editar</button>
                                        <button onClick={() => handleDelete(h.id)} className={styles.deleteButton}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </BaseLayout>
    )
}