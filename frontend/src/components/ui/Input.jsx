import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconClick,
    className = '',
    containerClassName = '',
    type = 'text',
    id,
    required,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-dark mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-muted" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark
            placeholder:text-muted
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            transition-all duration-200
            disabled:bg-gray-50 disabled:text-muted disabled:cursor-not-allowed
            ${error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}
            ${LeftIcon ? 'pl-10' : ''}
            ${RightIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {RightIcon && (
          <div
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'}`}
            onClick={onRightIconClick}
          >
            <RightIcon className="h-5 w-5 text-muted hover:text-dark transition-colors" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
});

export default Input;
