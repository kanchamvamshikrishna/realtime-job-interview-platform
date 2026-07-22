import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export const RoleRoute = ({ roles }) => {
  const { role } = useAuth();

  if (!roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
