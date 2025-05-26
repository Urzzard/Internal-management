import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BaseLayout } from '../../../../components/layout/BaseLayout';
import api from '../../../../api/axios';
import { getAllPers } from '../../api/crud-personal.api';
import styles from './RegistroTareoDiario.module.css';

export function RegistroTareoDiario() {
    const [personalList, setPersonalList] = useState([]);
    const [selectedPersonalId, setSelectedPersonalId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [jornadaActual, setJornadaActual] = useState(null);
    const [isLoadingPersonal, setIsLoadingPersonal] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingJornada, setIsLoadingJornada] = useState(false);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            hora_entrada: '',
            hora_inicio_descanso: '',
            hora_fin_descanso: '',
            hora_salida: ''
        }
    });


    useEffect(() => {
        setIsLoadingPersonal(true);
        getAllPers()
            .then(response => {
                setPersonalList(response.data);
            })
            .catch(error => {
                console.error("Error cargando lista de personal:", error);
                toast.error("No se pudo cargar el personal.");
            })
            .finally(() => setIsLoadingPersonal(false));
    }, []);


    useEffect(() => {
        if (selectedPersonalId && selectedDate) {
            setIsLoadingJornada(true);
            reset({
                hora_entrada: '', hora_inicio_descanso: '',
                hora_fin_descanso: '', hora_salida: ''
            });
            setJornadaActual(null);

            api.get(`/personal/api-personal/jornadas-laborales/`, {
                params: { personal: selectedPersonalId, fecha: selectedDate }
            })
            .then(response => {
                if (response.data && response.data.results && response.data.results.length > 0) {
                    const jornada = response.data.results[0];
                    setJornadaActual(jornada);
                    setValue('hora_entrada', jornada.marcacion_entrada_info?.fecha_hora_efectiva ? new Date(jornada.marcacion_entrada_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '');
                    setValue('hora_inicio_descanso', jornada.marcacion_inicio_descanso_info?.fecha_hora_efectiva ? new Date(jornada.marcacion_inicio_descanso_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '');
                    setValue('hora_fin_descanso', jornada.marcacion_fin_descanso_info?.fecha_hora_efectiva ? new Date(jornada.marcacion_fin_descanso_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '');
                    setValue('hora_salida', jornada.marcacion_salida_info?.fecha_hora_efectiva ? new Date(jornada.marcacion_salida_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '');
                } else {
                    setJornadaActual(null);
                }
            })
            .catch(error => {
                console.error("Error cargando jornada laboral existente:", error);
                if (error.response?.status !== 404) {
                    toast.error("Error al cargar datos de la jornada.");
                }
                setJornadaActual(null);
            })
            .finally(() => setIsLoadingJornada(false));
        } else {
            setJornadaActual(null);
            reset();
        }
    }, [selectedPersonalId, selectedDate, setValue, reset]);
    

    const onSubmitManual = async (data) => {
        if (!selectedPersonalId || !selectedDate) {
            toast.error("Seleccione personal y fecha.");
            return;
        }
        setIsSubmitting(true);
        const payload = {
            personal_id: parseInt(selectedPersonalId),
            fecha: selectedDate,
            hora_entrada: data.hora_entrada || null,
            hora_inicio_descanso: data.hora_inicio_descanso || null,
            hora_fin_descanso: data.hora_fin_descanso || null,
            hora_salida: data.hora_salida || null,
            es_jornada_normal: false
        };

        try {
            const response = await api.post('/personal/api-personal/registrar-jornada-completa/', payload);
            setJornadaActual(response.data);
            toast.success("Marcaciones manuales guardadas y jornada procesada.");
        } catch (error) {
            console.error("Error guardando marcaciones manuales:", error.response?.data || error);
            toast.error(error.response?.data?.error || "Error al guardar marcaciones.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleRegistrarJornadaNormal = async () => {
        if (!selectedPersonalId || !selectedDate) {
            toast.error("Seleccione personal y fecha.");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            personal_id: parseInt(selectedPersonalId),
            fecha: selectedDate,
            es_jornada_normal: true
        };

        try {
            const response = await api.post('/personal/api-personal/registrar-jornada-completa/', payload);
            setJornadaActual(response.data);
            setValue('hora_entrada', response.data.marcacion_entrada_info?.fecha_hora_efectiva ? new Date(response.data.marcacion_entrada_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) : '');
            setValue('hora_inicio_descanso', response.data.marcacion_inicio_descanso_info?.fecha_hora_efectiva ? new Date(response.data.marcacion_inicio_descanso_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) : '');
            setValue('hora_fin_descanso', response.data.marcacion_fin_descanso_info?.fecha_hora_efectiva ? new Date(response.data.marcacion_fin_descanso_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) : '');
            setValue('hora_salida', response.data.marcacion_salida_info?.fecha_hora_efectiva ? new Date(response.data.marcacion_salida_info.fecha_hora_efectiva).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) : '');
            toast.success("Jornada normal registrada y procesada.");
        } catch (error) {
            console.error("Error registrando jornada normal:", error.response?.data || error);
            toast.error(error.response?.data?.error || "Error al registrar jornada normal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <BaseLayout breadcrumbs={[
            { label: 'INICIO', path: '/inicio' },
            { label: 'PERSONAL', path: '/personal'},
            { label: 'REGISTRO DE TAREO DIARIO', path: '/control-personal/tareo-diario' }
        ]}>

            <div className={styles.tareoContainer}>
                <h2>Registro de Tareo Diario (Manera 1)</h2>

                <div className={styles.selectorSection}>
                    <div className={styles.formGroup}>
                        <label htmlFor="personal">Personal:</label>
                        <select
                            id="personal"
                            value={selectedPersonalId}
                            onChange={(e) => setSelectedPersonalId(e.target.value)}
                            disabled={isLoadingPersonal}
                        >
                            <option value="">Seleccione personal...</option>
                            {personalList.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.a_paterno} {p.a_materno}, {p.nombre} ({p.dni})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="fecha">Fecha:</label>
                        <input
                            type="date"
                            id="fecha"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                {isLoadingJornada && <p>Cargando datos de jornada...</p>}

                {selectedPersonalId && selectedDate && !isLoadingJornada && (
                    <>

                        <form onSubmit={handleSubmit(onSubmitManual)} className={styles.marcacionesForm}>
                            <h4>Registrar Horas Manualmente:</h4>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="hora_entrada">Hora Entrada (HH:MM):</label>
                                    <input type="time" id="hora_entrada" {...register("hora_entrada")} step="1" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="hora_inicio_descanso">Inicio Descanso (HH:MM):</label>
                                    <input type="time" id="hora_inicio_descanso" {...register("hora_inicio_descanso")} step="1" />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="hora_fin_descanso">Fin Descanso (HH:MM):</label>
                                    <input type="time" id="hora_fin_descanso" {...register("hora_fin_descanso")} step="1" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="hora_salida">Hora Salida (HH:MM):</label>
                                    <input type="time" id="hora_salida" {...register("hora_salida")} step="1" />
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting || isLoadingJornada} className={styles.saveButton}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Marcaciones Manuales'}
                            </button>
                        </form>

                        <button
                            onClick={handleRegistrarJornadaNormal}
                            disabled={isSubmitting || isLoadingJornada}
                            className={styles.normalButton}
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrar Jornada Normal (Teórica)'}
                        </button>

                        {jornadaActual && (
                            <div className={styles.jornadaResumen}>
                                <h4>Resumen de Jornada Procesada:</h4>
                                <p><strong>Estado Marcaciones:</strong> {jornadaActual.estado_marcaciones}</p>
                                <p><strong>Estado Jornada:</strong> {jornadaActual.estado_jornada}</p>
                                <p><strong>Minutos Tardanza:</strong> {jornadaActual.minutos_tardanza_calculados}</p>
                                <p><strong>Horas Normales:</strong> {jornadaActual.horas_normales_calculadas}</p>
                                <p><strong>Horas Extra Potenciales:</strong> {jornadaActual.horas_extra_potenciales}</p>
                                <p><strong>Horas Extra Aprobadas:</strong> {jornadaActual.horas_extra_aprobadas}</p>
                                <p><strong>Aplica Dominical:</strong> {jornadaActual.aplica_dominical_calculado ? 'Sí' : 'No'}</p>
                                {jornadaActual.observaciones_supervisor && <p><strong>Observaciones:</strong> {jornadaActual.observaciones_supervisor}</p>}
                            </div>
                        )}

                    </>
                )}

            </div>

        </BaseLayout>
    )

}