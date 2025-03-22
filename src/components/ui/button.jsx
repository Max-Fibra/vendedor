export function Button({ children, className = "", ...props }) {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  