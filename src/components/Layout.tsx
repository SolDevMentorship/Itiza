interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
      <div className="min-h-screen relative z-1">
        {children}
      </div>
  );
};
