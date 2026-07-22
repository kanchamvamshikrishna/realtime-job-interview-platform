import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  return {
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken && user),
    role: user?.role,
  };
};
