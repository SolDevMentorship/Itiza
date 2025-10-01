import type React from "react";
interface UnwrapModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export default function UnwrapModal({ isOpen, onClose }: UnwrapModalProps): React.JSX.Element;
export {};
