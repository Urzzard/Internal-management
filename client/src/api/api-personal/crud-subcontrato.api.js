import axios from 'axios'

const subApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Subcontrato/",
});

export const getAllsub = () => subApi.get("/");
export const createsub = (sub) => subApi.post("/", sub);
export const deletesub = (id) => subApi.delete(`${id}/`);
export const updatesub = (id, sub) => subApi.put(`${id}/`, sub);