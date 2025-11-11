import { useContext } from 'react';
import { ManagerContext } from '../contexts/ManagerContext';


export const useManagerContext = () => {
  const context = useContext(ManagerContext);

  if (!context) {
    throw new Error('useManagerContext phải dùng trong ManagerLayout');
  }

  return context;
};
