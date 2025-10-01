import React from "react";
interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}
declare const SignUpModal: React.FC<Props>;
export default SignUpModal;
