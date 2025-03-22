const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
