import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose }) => {
  if (!visible) return null;

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const textColor = 'text-white';

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-md ${bgColor} ${textColor} text-sm font-medium shadow-lg`}
         role="alert"
         onClick={onClose}>
      {message}
    </div>
  );
};

export default Toast;