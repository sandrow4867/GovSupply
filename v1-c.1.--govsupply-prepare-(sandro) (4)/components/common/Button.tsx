import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform";

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-md hover:shadow-lg hover:-translate-y-px',
    secondary: 'bg-light-gray text-navy/90 hover:bg-medium-gray/20 focus:ring-navy/50 dark:bg-navy dark:text-light-gray/90 dark:hover:bg-white/5 dark:focus:ring-light-gray/50',
    dark: 'bg-navy text-white hover:bg-dark-blue focus:ring-navy/50 shadow-md hover:shadow-lg hover:-translate-y-px',
    outline: 'bg-white text-navy/90 border border-medium-gray/50 hover:bg-light-gray focus:ring-navy/50 dark:bg-navy dark:text-light-gray/90 dark:border-medium-gray/70 dark:hover:bg-white/5',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const loadingSpinner = (
    <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${variant === 'primary' || variant === 'dark' ? 'text-white' : 'text-navy dark:text-light-gray'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && loadingSpinner}
      {children}
    </button>
  );
};