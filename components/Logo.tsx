
import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg', showText?: boolean }> = ({ 
  size = 'md', 
  showText = true 
}) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  return (
    <div className="flex items-center gap-2.5 group select-none">
      <div className={`${sizes[size]} aspect-square relative flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-110">
          <circle cx="50" cy="50" r="46" fill="white" stroke="#e30613" strokeWidth="8" />
          <path d="M50 20 V80 M20 50 H80" stroke="#00a651" strokeWidth="12" strokeLinecap="round" />
          <circle cx="50" cy="50" r="10" fill="#e30613" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900 text-lg leading-none tracking-tight flex items-center">
            CHABRA<span className="text-green-600 ml-0.5">.</span>
          </span>
          <span className="text-[8px] text-gray-400 uppercase tracking-[0.25em] font-bold mt-0.5">Gestão de Operações</span>
        </div>
      )}
    </div>
  );
};
