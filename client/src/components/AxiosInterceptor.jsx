import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AxiosInterceptor = ({children}) => {
    const {logout} = useAuth();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if(error.response?.status === 400){
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        }
    }, [logout]);

    return children;
}

export default AxiosInterceptor;