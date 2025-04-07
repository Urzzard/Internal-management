import axios from 'axios'

const gremiApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Gremio/",
});

export const getAllGremio = () => gremiApi.get("/");
export const createGremio = (gremio) => gremiApi.post("/", gremio);
export const deleteGremio = (id) => gremiApi.delete(`${id}/`);
export const updateGremio = (id, gremio) => gremiApi.put(`${id}/`, gremio);
