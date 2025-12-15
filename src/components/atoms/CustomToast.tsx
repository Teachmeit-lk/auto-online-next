"use client";
import React from 'react';
import toast, { Toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface CustomToastProps {
  t: Toast;
  message: string;
  type:  'success' | 'error' | 'warning' | 'info';
}

export const CustomToast: React.FC<CustomToastProps> = ({ t, message, type }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error:  <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div
      className={`${bgColors[type]} ${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full border rounded-lg shadow-lg p-4 flex items-start gap-3`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};