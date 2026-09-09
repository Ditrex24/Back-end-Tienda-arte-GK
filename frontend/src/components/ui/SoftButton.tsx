import React from 'react';

interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const SoftButton: React.FC<SoftButtonProps> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const base = 'rounded-full px-6 py-3 font-medium transition-all shadow-[0_8px_20px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-offset-2';
  const styles = variant === 'primary'
    ? 'bg-white text-slate-800 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5'
    : 'bg-slate-50 text-slate-700 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5';
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
};
