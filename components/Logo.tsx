
import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg', showText?: boolean }> = ({ 
  size = 'md', 
  showText = true 
}) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className={`${sizes[size]} aspect-square relative flex items-center justify-center`}>
        {/* Logo Chabra estilizada com formas geométricas modernas */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-105">
          <circle cx="50" cy="50" r="48" fill="none" stroke="#e30613" strokeWidth="4" />
          <rect x="42" y="15" width="16" height="70" rx="4" fill="#e30613" />
          <rect x="15" y="42" width="70" height="16" rx="4" fill="#00a651" />
          <rect x="42" y="42" width="16" height="16" fill="white" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900 text-lg leading-none tracking-tight">
            CHABRA<span className="text-green-600">.</span>
          </span>
          <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold">Internal Ops</span>
        </div>
      )}
    </div>
  );
};
