import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:ring-blue-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm focus:ring-gray-200",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 focus:ring-red-200",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};