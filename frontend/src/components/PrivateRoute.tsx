import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div style={{ padding: '20px', fontSize: '18px' }}>Chargement...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}