import axios from 'axios'

const username = "urzzard";
const baseURL = "http://api.geonames.org";

export const getPaises = async () =>{
    try{
        const response = await axios.get(`${baseURL}/countryInfoJSON`, {
            params: {username},
        });
        return response.data.geonames;
    } catch (error) {
        console.error("Error fetching countries: ",error);
        throw error;
    }
};


export const getRegiones = async (geonameId) =>{
    try{
        const response = await axios.get(`${baseURL}/childrenJSON`, {
            params: {geonameId, username},
        });
        return response.data.geonames;
    } catch (error) {
        console.error("Error fetching regions: ",error);
        throw error;
    }
};


export const getProvincias = async (geonameId) =>{
    try{
        const response = await axios.get(`${baseURL}/childrenJSON`, {
            params: {geonameId, username},
        });
        return response.data.geonames;
    } catch (error) {
        console.error("Error fetching provinces: ",error);
        throw error;
    }
};

export const getDistritos = async (geonameId) =>{
    try{
        const response = await axios.get(`${baseURL}/childrenJSON`, {
            params: {geonameId, username},
        });
        return response.data.geonames;
    } catch (error) {
        console.error("Error fetching districts: ",error);
        throw error;
    }
};