import axios from 'axios'

const rangoApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Rango/",
});

export const getAllrango = () => rangoApi.get("/");
export const createrango = (rango) => rangoApi.post("/", rango);
export const deleterango = (id) => rangoApi.delete(`${id}/`);
export const updaterango = (id, rango) => rangoApi.put(`${id}/`, rango);