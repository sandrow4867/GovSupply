
import React from 'react';

interface TagProps {
  children: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ children }) => {
  return (
    <span className="inline-block bg-slate-100 text-slate-600 rounded-md px-2.5 py-1 text-xs font-medium">
      {children}
    </span>
  );
};
