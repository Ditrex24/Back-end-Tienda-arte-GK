'use client';

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
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  const bgStyles = isSuccess
    ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
    : 'bg-rose-950/95 text-white border-rose-500/40 shadow-[0_10px_30px_rgba(225,29,72,0.25)]';

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-md w-auto min-w-[280px] sm:min-w-[320px] border backdrop-blur-md rounded-2xl px-5 py-4 ${bgStyles} transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4 flex items-center justify-between space-x-4`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl flex-shrink-0">
          {isSuccess ? '✅' : '⚠️'}
        </span>
        <p className="text-sm font-medium leading-snug">{message}</p>
      </div>

      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-white transition-colors p-1 text-base leading-none focus:outline-none cursor-pointer"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};
