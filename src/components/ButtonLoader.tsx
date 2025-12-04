interface ButtonLoaderProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export default function ButtonLoader({ variant = 'light', size = 'md' }: ButtonLoaderProps) {
  const sizeClasses = {
    sm: 'w-3 h-3 border',
    md: 'w-4 h-4 border-2',
    lg: 'w-5 h-5 border-2',
  };

  return (
    <span
      className={`btn-loader ${variant === 'dark' ? 'btn-loader-dark' : ''} ${sizeClasses[size]}`}
      aria-label="Loading"
    />
  );
}
