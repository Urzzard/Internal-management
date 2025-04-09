import api from "../../../api/axios";

const url = "/personal/api-personal/Pcasa/"; 

export const getAllpcasa = () => api.get(url);
export const createpcasa = (pcasa) => api.post(url, pcasa);
export const deletepcasa = (id) => api.delete(`${url}${id}/`);
export const updatepcasa = (id, pcasa) => api.put(`${url}${id}/`, pcasa);