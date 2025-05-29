import api from '../../../api/axios';

const BASE_URL = '/personal/api-personal/Asignaciones-horario/';

export const getAllAsignacionesHorario = (params) => api.get(BASE_URL, { params });

export const getAsignacionHorario = (id) => api.get(`${BASE_URL}${id}/`);

export const createAsignacionHorario = (data) => api.post(BASE_URL, data);

export const updateAsignacionHorario = (id, data) => api.put(`${BASE_URL}${id}/`, data);

export const deleteAsignacionHorario = (id) => api.delete(`${BASE_URL}${id}/`);