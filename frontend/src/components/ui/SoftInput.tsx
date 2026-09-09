import React from 'react';

interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const SoftInput: React.FC<SoftInputProps> = ({ label, className = '', ...rest }) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`bg-slate-50 rounded-2xl border border-slate-100/50 focus:outline-none focus:ring-2 focus:ring-slate-200 outline-none px-4 py-2.5 transition-all ${className}`}
        {...rest}
      />
    </div>
  );
};
