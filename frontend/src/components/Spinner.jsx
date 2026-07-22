export const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center py-8 ${className}`}>
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
  </div>
);
