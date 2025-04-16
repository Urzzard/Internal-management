import api from "../../../api/axios"

const url = "/personal/api-personal/AdminManageUsers/";

export const getAllManagedUsers = () => api.get(url);
export const getManagedUser = (id) => api.get(`${url}${id}/`);
export const updateManagedUser = (id, userData) => api.patch(`${url}${id}/`, userData);
export const deactivateManagedUser = (id) => api.delete(`${url}${id}/`);
export const reactivateManagedUser = (id) => api.patch(`${url}${id}/`, {is_active: true});