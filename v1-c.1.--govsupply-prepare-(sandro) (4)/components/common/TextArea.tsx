import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // FIX: Changed label type from string to React.ReactNode to allow JSX elements.
  label?: React.ReactNode;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className, ...props }) => {
  const baseClasses = "block w-full px-3 py-2 bg-white dark:bg-dark-blue border border-medium-gray/50 dark:border-medium-gray/70 rounded-lg placeholder-medium-gray dark:placeholder-medium-gray/60 focus:outline-none focus:border-navy dark:focus:border-light-gray transition text-navy dark:text-light-gray";

  return (
    <div>
      {label && <label className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{label}</label>}
      <textarea
        className={`${baseClasses} ${className}`}
        {...props}
      />
    </div>
  );
};
