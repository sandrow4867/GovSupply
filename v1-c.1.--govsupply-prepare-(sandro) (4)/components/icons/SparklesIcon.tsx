import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L13.9497 10.0503L22 12L13.9497 13.9497L12 22L10.0503 13.9497L2 12L10.0503 10.0503L12 2Z" />
    <path d="M18 6L19 5" />
    <path d="M6 18L5 19" />
  </svg>
);
