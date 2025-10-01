import { type ReactNode } from "react";
interface WalletContextType {
    address: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    signMessage: (message: string) => Promise<string>;
}
export declare function WalletProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare const useWallet: () => WalletContextType;
export {};
