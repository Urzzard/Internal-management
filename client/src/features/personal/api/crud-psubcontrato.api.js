import api from "../../../api/axios";

const url = "/personal/api-personal/Psubcontrato/"; 

export const getAllpsubc = () => api.get(url);
export const createpsubc = (psubc) => api.post(url, psubc);
export const deletepsubc = (id) => api.delete(`${url}${id}/`);
export const updatepsubc = (id, psubc) => api.put(`${url}${id}/`, psubc);