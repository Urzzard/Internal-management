import api from "../../../api/axios";

const url = "/personal/api-personal/Gremio/"; 

export const getAllGremio = () => api.get(url);
export const createGremio = (gremio) => api.post(url, gremio);
export const deleteGremio = (id) => api.delete(`${url}${id}/`);
export const updateGremio = (id, gremio) => api.put(`${url}${id}/`, gremio);
