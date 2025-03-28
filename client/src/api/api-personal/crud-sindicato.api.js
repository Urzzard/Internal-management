import axios from 'axios'

const sindiApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Sindicato/",
});

export const getAllsindi = () => sindiApi.get("/");
export const createsindi = (sindi) => sindiApi.post("/", sindi);
export const deletesindi = (id) => sindiApi.delete(`${id}/`);
export const updatesindi = (id, sindi) => sindiApi.put(`${id}/`, sindi);