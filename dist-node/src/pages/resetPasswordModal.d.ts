import React from "react";
interface Props {
    isOpen: boolean;
    onClose: () => void;
    prefillEmail?: string | null;
}
declare const ResetPasswordModal: React.FC<Props>;
export default ResetPasswordModal;
