import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { connectSocket, disconnectSocket } from '../features/chat/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, accessToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    const s = connectSocket(accessToken);
    setSocket(s);

    const handleOnline = ({ userId }) => setOnlineUsers((prev) => new Set(prev).add(userId));
    const handleOffline = ({ userId }) =>
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    const showToast = (message) => {
      setToast(message);
      clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(null), 5000);
    };

    const handleStatusUpdate = (payload) => {
      showToast(payload.notification?.message || 'Your application status was updated');
    };
    const handleNewApplication = (payload) => {
      showToast(payload.notification?.message || 'You received a new application');
    };

    s.on('user_online', handleOnline);
    s.on('user_offline', handleOffline);
    s.on('application_status_updated', handleStatusUpdate);
    s.on('new_application', handleNewApplication);

    return () => {
      s.off('user_online', handleOnline);
      s.off('user_offline', handleOffline);
      s.off('application_status_updated', handleStatusUpdate);
      s.off('new_application', handleNewApplication);
    };
  }, [isAuthenticated, accessToken]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
          {toast}
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider');
  return ctx;
};
