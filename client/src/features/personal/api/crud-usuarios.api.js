import api from "../../../api/axios";

const url = "/personal/api-personal/Usuarios/"; 

export const getAllU = () => api.get(url);
export const createU = (formData) => api.post(url, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const deleteU = (id) => api.delete(`${url}${id}/`);
export const updateU = (id, formData) => api.put(`${url}${id}/`, formData,{
    headers:{
        'Content-Type': 'multipart/form-data'
    }
});