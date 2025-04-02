import axios from 'axios'

const pcasaApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Pcasa/",
});

export const getAllpcasa = () => pcasaApi.get("/");
export const createpcasa = (pcasa) => pcasaApi.post("/", pcasa);
export const deletepcasa = (id) => pcasaApi.delete(`${id}/`);
export const updatepcasa = (id, pcasa) => pcasaApi.put(`${id}/`, pcasa);