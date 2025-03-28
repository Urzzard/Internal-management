import axios from 'axios'

const uApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Usuarios/",
});

export const getAllU = () => uApi.get("/");
export const createU = (formData) => uApi.post("/", formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const deleteU = (id) => uApi.delete(`${id}/`);
export const updateU = (id, formData) => uApi.put(`${id}/`, formData,{
    headers:{
        'Content-Type': 'multipart/form-data'
    }
});