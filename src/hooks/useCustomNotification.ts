import { notification } from 'antd';

const useCustomNotification = () => {
  const [noti, contextHolder] = notification.useNotification();

  const config = {
    duration: 4.5,
    pauseOnHover: true,
    showProgress: true,
  };

  return {
    contextHolder,
    toastSuccess: (message: string, description: string) =>
      noti.success({
        message,
        description,
        ...config,
      }),
    toastError: (message: string, description: string) =>
      noti.error({
        message,
        description,
        ...config,
      }),
    toastWarning: (message: string, description: string) =>
      noti.warning({
        message,
        description,
        ...config,
      }),
    toastInfo: (message: string, description: string) =>
      noti.info({
        message,
        description,
        ...config,
      }),
  };
};

export default useCustomNotification;
