import React from "react";
interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignup: () => void;
    onSwitchToResetPasswordModal: () => void;
    setIsLoggedIn: (loggedIn: boolean) => void;
    setUserFullName: (fullName: string) => void;
    disableClose?: boolean;
    hideSecondaryActions?: boolean;
}
declare const LoginModal: React.FC<Props>;
export default LoginModal;
