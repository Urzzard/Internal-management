import api from '../../../api/axios';

const JORNADAS_BASE_URL = '/personal/api-personal/Jornadas-laborales/';
const REGISTRAR_JORNADA_COMPLETA_URL = '/personal/api-personal/registrar-jornada-completa/';

export const getJornadaLaboralPorPersonalYFecha = async (personalId, fecha) => {
    try {
        const response = await api.get(JORNADAS_BASE_URL, {
            params: { personal: personalId, fecha: fecha, limit: 1 }
        });

        if (response.data && response.data.results && response.data.results.length > 0) {
            return response.data.results[0];
        }

        return null;
    } catch (error) {
        console.error("Error fetching jornada laboral:", error.response?.data || error);
        if (error.response?.status !== 404) {
            toast.error("Error al cargar datos de la jornada.");
        }
        return null;
    }
};


export const registrarJornadaCompleta = async (payload) => {
    const response = await api.post(REGISTRAR_JORNADA_COMPLETA_URL, payload);
    return response.data;
};

