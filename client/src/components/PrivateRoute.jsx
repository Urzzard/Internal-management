import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user } = useAuth();
    const location = useLocation();
    
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (adminOnly && !user.is_superuser) {
        return <Navigate to="/inicio" replace />;
    }
    
    return children;
};