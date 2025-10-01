import { Dispatch, SetStateAction } from "react";
interface LandingHeaderProps {
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    setShowLoginModal: Dispatch<SetStateAction<boolean>>;
    setShowSignUpModal: Dispatch<SetStateAction<boolean>>;
}
export default function LandingHeader({ isLoggedIn, setIsLoggedIn, setShowLoginModal, }: LandingHeaderProps): import("react").JSX.Element;
export {};
