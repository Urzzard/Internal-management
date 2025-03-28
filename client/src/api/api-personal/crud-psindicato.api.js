import axios from 'axios'

const psindiApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Psindicato/",
});

export const getAllpsindi = () => psindiApi.get("/");
export const createpsindi = (psindi) => psindiApi.post("/", psindi);
export const deletepsindi = (id) => psindiApi.delete(`${id}/`);
export const updatepsindi = (id, psindi) => psindiApi.put(`${id}/`, psindi);