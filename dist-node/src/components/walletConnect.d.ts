import * as React from "react";
import { ReactNode } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletContextState } from "@solana/wallet-adapter-react";
interface WalletContextProviderProps {
    children: ReactNode;
}
export declare const CustomWalletMultiButton: () => React.JSX.Element;
declare const WalletContextProvider: React.FC<WalletContextProviderProps>;
export declare const useWallet: () => WalletContextState;
export default WalletContextProvider;
