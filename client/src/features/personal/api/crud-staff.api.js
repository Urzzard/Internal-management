import api from '../../../api/axios'

export const getAllStaff = () => api.get("/personal/api-personal/Staff/");
export const createStaff = (staffData) => api.post("/personal/api-personal/Staff/", staffData);
export const deleteStaff = (id) => api.delete(`/personal/api-personal/Staff/${id}/`);
export const updateStaff = (id, staffData) => api.patch(`/personal/api-personal/Staff/${id}/`, staffData);
export const getEligibleUsers = () => api.get("/personal/api-personal/eligible-users/");
export const getEligiblePersonal = () => api.get("/personal/api-personal/eligible-personal/");
export const adminCreateUser = (userData) => api.post("/personal/api-personal/AdminCreateUser/", userData);

/* export {getAllPers} from './crud-personal.api' */