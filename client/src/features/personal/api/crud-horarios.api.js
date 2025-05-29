import api from '../../../api/axios';

const BASE_URL = '/personal/api-personal/Horarios-trabajo/';

export const getAllHorariosTrabajo = () => api.get(BASE_URL);

export const getHorarioTrabajo = (id) => api.get(`${BASE_URL}${id}/`);

export const createHorarioTrabajo = (data) => api.post(BASE_URL, data);

export const updateHorarioTrabajo = (id, data) => api.put(`${BASE_URL}${id}/`, data);

export const deleteHorarioTrabajo = (id) => api.delete(`${BASE_URL}${id}/`);

