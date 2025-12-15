"use client";
import toast from 'react-hot-toast';
import { CustomToast } from '@/components/atoms/CustomToast';

export const showToast = {
  success: (message: string) => {
    toast.custom(
      (t) => <CustomToast t={t} message={message} type="success" />,
      {
        duration: 4000,
      }
    );
  },

  error: (message: string) => {
    toast.custom(
      (t) => <CustomToast t={t} message={message} type="error" />,
      {
        duration: 4000,
      }
    );
  },

  warning: (message: string) => {
    toast.custom(
      (t) => <CustomToast t={t} message={message} type="warning" />,
      {
        duration: 3500,
      }
    );
  },

  info: (message:  string) => {
    toast.custom(
      (t) => <CustomToast t={t} message={message} type="info" />,
      {
        duration: 3500,
      }
    );
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#363636',
        color: '#fff',
      },
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};