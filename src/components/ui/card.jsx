export function Card({ children, className = "" }) {
    return (
      <div className={`rounded-xl border bg-white text-black shadow-sm ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children, className = "" }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
  }
  