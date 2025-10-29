import React from 'react';

export const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M15 4V2" />
    <path d="M15 10v-2" />
    <path d="M15 16v-2" />
    <path d="M15 22v-2" />
    <path d="M17.6 6.4 19 5" />
    <path d="M17.6 17.6 19 19" />
    <path d="M5 19 6.4 17.6" />
    <path d="M5 5l1.4 1.4" />
    <path d="m21 12-2.3 .2" />
    <path d="M5.3 11.8 3 12" />
    <path d="M12 21l-.2-2.3" />
    <path d="M12 5.3 11.8 3" />
    <path d="m5 12 5.1 2 1.9 5 1.9-5L19 12l-5.1-2-1.9-5-1.9 5Z" />
  </svg>
);
