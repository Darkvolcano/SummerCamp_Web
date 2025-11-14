import React, { createContext, useContext } from 'react';
import useCustomNotification from '../hooks/useCustomNotification';

interface NotificationContextType {
  toastSuccess: (message: string, description: string) => void;
  toastError: (message: string, description: string) => void;
  toastWarning: (message: string, description: string) => void;
  toastInfo: (message: string, description: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { contextHolder, toastSuccess, toastError, toastWarning, toastInfo } = useCustomNotification();

  return (
    <NotificationContext.Provider
      value={{ toastSuccess, toastError, toastWarning, toastInfo }}
    >
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
