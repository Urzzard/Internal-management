import api from "../../../api/axios";

const url = "/personal/api-personal/Psindicato/"; 

export const getAllpsindi = () => api.get(url);
export const createpsindi = (psindi) => api.post(url, psindi);
export const deletepsindi = (id) => api.delete(`${url}${id}/`);
export const updatepsindi = (id, psindi) => api.put(`${url}${id}/`, psindi);