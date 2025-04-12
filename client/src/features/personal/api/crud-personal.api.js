import api from "../../../api/axios";

const url = "/personal/api-personal/Personal/"; 

export const getAllPers = () => api.get(url);
export const createPers = (formData) => api.post(url, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const deletePers = (id) => api.delete(`${url}${id}/`);
export const updatePers = (id, formData) => api.put(`${url}${id}/`, formData,{
    headers:{
        'Content-Type': 'multipart/form-data'
    }
});