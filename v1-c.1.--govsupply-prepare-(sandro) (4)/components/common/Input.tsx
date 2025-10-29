import React, { forwardRef, useState, useEffect, useRef, useId } from 'react';
import { CalendarIcon } from '../icons/CalendarIcon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  endAdornmentBehavior?: 'end' | 'stick';
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className, startAdornment, endAdornment, endAdornmentBehavior = 'end', error = false, type, ...props }, ref) => {
  const [inputValue, setInputValue] = useState(props.value || '');
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [adornmentLeft, setAdornmentLeft] = useState(0);
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  useEffect(() => {
    setInputValue(props.value || '');
  }, [props.value]);

  useEffect(() => {
    if (endAdornmentBehavior === 'stick' && mirrorRef.current) {
        setAdornmentLeft(mirrorRef.current.offsetWidth + 2); // 2px offset
    }
  }, [inputValue, endAdornmentBehavior]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const isDateType = type === 'date' || type === 'datetime-local';
  
  const calendarIconAdornment = (
    <CalendarIcon className="w-5 h-5 text-navy/80 dark:text-light-gray/80" />
  );

  const baseContainerClasses = "flex items-center w-full bg-white dark:bg-dark-blue border rounded-lg transition px-3 py-2 relative";
  
  const stateClasses = error 
    ? "border-accent"
    : "border-medium-gray/50 dark:border-medium-gray/70 focus-within:border-navy dark:focus-within:border-light-gray";
  
  const inputClasses = `block w-full p-0 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-medium-gray dark:placeholder-medium-gray/60 text-navy dark:text-light-gray ${isDateType ? 'cursor-pointer' : ''}`;

  const ContainerComponent = isDateType ? 'label' : 'div';

  return (
    <div>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-navy/90 dark:text-light-gray/90 mb-1">{label}</label>}
      <ContainerComponent 
        htmlFor={isDateType ? inputId : undefined}
        className={`${baseContainerClasses} ${stateClasses} ${className || ''} ${isDateType ? 'cursor-pointer' : ''}`}
      >
        {startAdornment && (
          <span className="flex items-center pr-2 text-medium-gray dark:text-medium-gray/70">
            {startAdornment}
          </span>
        )}
        <input
          id={inputId}
          className={inputClasses}
          ref={(node) => {
            internalInputRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          value={inputValue}
          onChange={handleChange}
          type={type}
          {...props}
        />
        {endAdornmentBehavior === 'stick' && (
            <span
              ref={mirrorRef}
              className="absolute invisible whitespace-pre -z-10"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                left: '12px',
              }}
            >
              {inputValue}
            </span>
        )}
        {(endAdornment || isDateType) && (
            endAdornmentBehavior === 'stick' ? (
                 <span 
                    className="absolute flex items-center text-navy/80 dark:text-light-gray/80 pointer-events-none transition-all duration-100"
                    style={{ left: `calc(12px + ${adornmentLeft}px)` }}
                >
                    {isDateType ? calendarIconAdornment : endAdornment}
                </span>
            ) : (
                <span className="flex items-center pl-2 text-navy/80 dark:text-light-gray/80">
                    {isDateType ? calendarIconAdornment : endAdornment}
                </span>
            )
        )}
      </ContainerComponent>
    </div>
  );
});