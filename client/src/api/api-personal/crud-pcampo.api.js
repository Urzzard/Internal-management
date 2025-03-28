import axios from 'axios'

const pcampoApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/PCampo/",
});

export const getAllpcampo = () => pcampoApi.get("/");
export const createpcampo = (pcampo) => pcampoApi.post("/", pcampo);
export const deletepcampo = (id) => pcampoApi.delete(`${id}/`);
export const updatepcampo = (id, pcampo) => pcampoApi.put(`${id}/`, pcampo);
