export const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-700"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {page} of {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-700"
      >
        Next
      </button>
    </div>
  );
};
