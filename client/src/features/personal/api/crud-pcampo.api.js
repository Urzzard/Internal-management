import api from "../../../api/axios";

const url = "/personal/api-personal/PCampo/"; 

export const getAllpcampo = () => api.get(url);
export const createpcampo = (pcampo) => api.post('/personal/api-personal/PCampo/', pcampo, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const deletepcampo = (id) => api.delete(`${url}${id}/`);
export const updatepcampo = (id, pcampo) => api.put(`${url}${id}/`, pcampo, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const getEligiblePersonal = () => api.get("/personal/api-personal/eligible-personal/");
