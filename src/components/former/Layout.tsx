import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { PageBackground } from "./background";

interface LayoutProps {
  children: React.ReactNode;
}

const getTitleFromPath = (pathname: string): string => {
  switch (pathname) {
    case "/":
      return "Dashboard";
    case "/gift-airtime":
      return "Gift Airtime";
    case "/gift-token":
      return "Gift Token";
    case "/gift-store":
      return "Gift Store";
    default:
      return "Gift Speaks";
  }
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);

  return (
    <PageBackground>
      <div className="min-h-screen relative z-1">
        <Header title={title} />
        {children}
      </div>
    </PageBackground>
  );
};
