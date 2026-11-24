export function Loader({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.md}
          rounded-full border-primary/20 border-t-primary
          animate-spin
        `}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
      </div>
      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 rounded-xl mb-4" />
      {/* Actions */}
      <div className="flex gap-4">
        <div className="h-8 w-20 bg-gray-200 rounded-lg" />
        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
        <div className="h-8 w-20 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-2xl" />
      <div className="px-6 pb-4">
        <div className="flex items-end gap-4 -mt-12 mb-4">
          <div className="h-24 w-24 rounded-full bg-gray-300 border-4 border-white" />
          <div className="flex-1 pb-2">
            <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Loader;
