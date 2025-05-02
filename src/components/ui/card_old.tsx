// Components
export function Card({ children, className, ...props }: any) {
  return (
    <div className={`rounded-xl shadow-md bg-white ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: any) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
