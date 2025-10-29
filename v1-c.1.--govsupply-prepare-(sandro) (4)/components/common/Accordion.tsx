import React, { useState } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-medium-gray/20 dark:border-white/10 rounded-lg overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-light-gray/50 dark:bg-dark-blue/50 hover:bg-medium-gray/10 dark:hover:bg-dark-blue transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="text-md font-semibold text-navy dark:text-white text-left">{title}</h3>
        <ChevronDownIcon className={`w-5 h-5 text-navy/70 dark:text-light-gray/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="p-4 bg-white dark:bg-navy border-t border-medium-gray/20 dark:border-white/10">
              {children}
            </div>
        </div>
      </div>
    </div>
  );
};
