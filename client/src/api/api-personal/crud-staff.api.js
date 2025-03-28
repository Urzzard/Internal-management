import axios from 'axios'

const staffApi = axios.create({
    baseURL: "http://localhost:8000/personal/api-personal/Staff/",
});

export const getAllStaff = () => staffApi.get("/");
export const createStaff = (staff) => staffApi.post("/", staff);
export const deleteStaff = (id) => staffApi.delete(`${id}/`);
export const updateStaff = (id, staff) => staffApi.put(`${id}/`, staff);
