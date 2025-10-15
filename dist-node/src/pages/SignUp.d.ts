interface SignUpModalProps {
    isOpen?: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}
export default function SignUpModal({ isOpen, onClose, onSwitchToLogin }: SignUpModalProps): import("react").JSX.Element | null;
export {};
