import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
export declare const invokeGiftToken: (connection: Connection, wallet: WalletContextState, giftAmount: number, recipientAddress: string, mintToPayWith: PublicKey, tokenMint: PublicKey) => Promise<boolean>;
