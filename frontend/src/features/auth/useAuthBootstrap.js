import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { authApi } from './authApi';
import { setCredentials, setAccessToken, logout } from './authSlice';

export const useAuthBootstrap = () => {
  const dispatch = useDispatch();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const hasStoredUser = Boolean(localStorage.getItem('user'));
    if (!hasStoredUser) {
      setIsBootstrapping(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const refreshResult = await dispatch(authApi.endpoints.refresh.initiate()).unwrap();
        dispatch(setAccessToken(refreshResult.data.accessToken));

        const meResult = await dispatch(authApi.endpoints.getMe.initiate()).unwrap();
        dispatch(
          setCredentials({
            user: meResult.data.user,
            accessToken: refreshResult.data.accessToken,
          })
        );
      } catch {
        dispatch(logout());
      } finally {
        setIsBootstrapping(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isBootstrapping };
};
