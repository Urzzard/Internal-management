import api from '../../../api/axios'

export const getAllStaff = () => api.get("/personal/api-personal/Staff/");
export const createStaff = (staff) => api.post("/personal/api-personal/Staff/", staff);
export const deleteStaff = (id) => api.delete(`/personal/api-personal/Staff/${id}/`);
export const updateStaff = (id, staff) => api.put(`/personal/api-personal/Staff/${id}/`, staff);
