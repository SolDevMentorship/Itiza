import * as React from "react";
import { createContext, useContext, useMemo, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletContextState } from "@solana/wallet-adapter-react";

// Define the props type for the provider
interface WalletContextProviderProps {
  children: ReactNode;
}

// Create the context with the correct type
const WalletContext = createContext<WalletContextState | null>(null);

export const CustomWalletMultiButton = () => {
  const wallet = useSolanaWallet();

  // Conditionally render button text based on connection state
  const buttonText = wallet.connected ? null : "CONNECT TO SOLANA";

  return (
    <WalletMultiButton style={connectButtonStyles}>
      {buttonText}
    </WalletMultiButton>
  );
};

// Button styles
const connectButtonStyles: React.CSSProperties = {
  backgroundColor: "#832c2c",
  color: "#fff",
  padding: "0.5rem 1rem",
  border: "2px solid antiquewhite",
  borderRadius: "5px",
  fontSize: "1rem",
  cursor: "pointer",
  marginLeft: "1rem",
};

const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
}) => {
  // Set the network endpoint as a variable
  const network = "https://api.devnet.solana.com"; // You can later swap this to Mainnet or Testnet

  // Memoize the wallet adapters, and depend on the network variable
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  const wallet = useSolanaWallet();

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={wallet}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === null) {
    throw new Error("useWallet must be used within a WalletContextProvider");
  }
  return context;
};

export default WalletContextProvider;
