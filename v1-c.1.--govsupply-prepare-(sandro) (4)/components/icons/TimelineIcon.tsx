import React from 'react';

export const TimelineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="18" r="3"></circle>
    <circle cx="6" cy="6" r="3"></circle>
    <circle cx="18" cy="6" r="3"></circle>
    <path d="M12 15V6.5"></path>
    <path d="m8.5 7.5 2.5 3.5"></path>
    <path d="m15.5 7.5-2.5 3.5"></path>
  </svg>
);