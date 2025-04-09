import api from "../../../api/axios";

const url = "/personal/api-personal/Rango/"; 

export const getAllrango = () => api.get(url);
export const createrango = (rango) => api.post(url, rango);
export const deleterango = (id) => api.delete(`${url}${id}/`);
export const updaterango = (id, rango) => api.put(`${url}${id}/`, rango);