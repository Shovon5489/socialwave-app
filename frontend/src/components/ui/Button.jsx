import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary-300 shadow-sm',
  secondary: 'bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary-300 shadow-sm',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary-300',
  ghost: 'text-dark hover:bg-gray-100 focus:ring-gray-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 shadow-sm',
  light: 'bg-gray-100 text-dark hover:bg-gray-200 focus:ring-gray-200',
  'ghost-primary': 'text-primary hover:bg-primary-50 focus:ring-primary-100',
};

const sizes = {
  xs: 'px-2 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

function Spinner({ size = 'sm' }) {
  const spinnerSize = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-4 w-4', lg: 'h-5 w-5', xl: 'h-6 w-6' };
  return (
    <svg
      className={`animate-spin ${spinnerSize[size]} mr-2`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  type = 'button',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        isDisabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Spinner size={size} />}
      {!loading && LeftIcon && <LeftIcon className="mr-2 h-4 w-4" />}
      {children}
      {!loading && RightIcon && <RightIcon className="ml-2 h-4 w-4" />}
    </button>
  );
}
