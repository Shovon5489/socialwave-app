export default function Card({
  children,
  className = '',
  padding = true,
  hover = false,
  onClick,
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-card
        ${padding ? 'p-4' : ''}
        ${hover ? 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
