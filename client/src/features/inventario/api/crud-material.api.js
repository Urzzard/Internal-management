import axios from 'axios'

const mApi = axios.create({
    baseURL: "http://localhost:8000/inventario/api-inventario/Material/",
});

export const getAllM = () => mApi.get("/");
export const createM = (mcat) => mApi.post("/", mcat);
export const deleteM = (id) => mApi.delete(`${id}/`);
export const updateM = (id, mcat) => mApi.put(`${id}/`, mcat);
export const importM = (data) =>{
    return axios.post('http://localhost:8000/inventario/api-inventario/import-materials/', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}