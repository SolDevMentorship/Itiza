export function Button({ children, className, ...props }: any) {
  return (
    <button
      className={`px-4 py-2 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
