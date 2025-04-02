import axios from 'axios'

const psubcApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Psubcontrato/",
});

export const getAllpsubc = () => psubcApi.get("/");
export const createpsubc = (psubc) => psubcApi.post("/", psubc);
export const deletepsubc = (id) => psubcApi.delete(`${id}/`);
export const updatepsubc = (id, psubc) => psubcApi.put(`${id}/`, psubc);