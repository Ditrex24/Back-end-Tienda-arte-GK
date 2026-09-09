import React, { useEffect, useState } from 'react';

interface ToastAlertProps {
  message: string;
  type?: 'error' | 'success';
  onClose?: () => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({ message, type = 'error', onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const bg = type === 'success' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800';

  return (
    <div
      className={`fixed top-4 right-4 max-w-xs w-full border rounded-2xl px-4 py-3 shadow-md ${bg} transition-opacity`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
