import axios from 'axios'

const mcatApi = axios.create({
    baseURL: "http://localhost:8000/inventario/api-inventario/Categoria/",
});

export const getAllMCats = () => mcatApi.get("/");
export const createMCats = (mcat) => mcatApi.post("/", mcat);
export const deleteMCats = (id) => mcatApi.delete(`${id}/`);
export const updateMCats = (id, mcat) => mcatApi.put(`${id}/`, mcat);