import { useNavigate, useLocation } from "react-router-dom";
import { CustomWalletMultiButton } from "./walletConnect";
import { GiftNotifications } from "./GiftNotification";

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== "/";

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center h-16 p-3 z-10 bg-[#eecbc8]/60 backdrop-blur-sm shadow-sm">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <button
            onClick={() => navigate("/")}
            className="text-[#832c2c] hover:text-[#632121]"
          >
            ← Back
          </button>
        )}
        <h1 className="text-2xl font-bold text-[#832c2c] tracking-wider">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <GiftNotifications />
        <CustomWalletMultiButton />
      </div>
    </div>
  );
};
