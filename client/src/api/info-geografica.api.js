import api from './axios'
import toast from 'react-hot-toast';

export const getPaises = async () =>{
    try{
        const response = await api.get('/personal/api-personal/Paises/');
        return response.data;
    } catch (error) {
        console.error("Error fetching countries: ", error);
        toast.error("Error al cargar paises.");
        throw error;
    }
};


export const getRegiones = async (paisId) =>{
    if(!paisId) return [];
    try{
        const response = await api.get('/personal/api-personal/Regiones/', {
            params: {pais: paisId},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching regions: ", error);
        toast.error("Error al cargar regiones.")
        throw error;
    }
};


export const getProvincias = async (regionId) =>{
    if(!regionId) return [];
    try{
        const response = await api.get('/personal/api-personal/Provincias/', {
            params: {region: regionId},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching provinces: ",error);
        toast.error("Error al cargar provincias.")
        throw error;
    }
};

export const getDistritos = async (provinciaId) =>{
    if(!provinciaId) return [];
    try{
        const response = await api.get('/personal/api-personal/Distritos/', {
            params: {provincia: provinciaId},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching districts: ",error);
        toast.error("Error al cargar distritos.")
        throw error;
    }
};