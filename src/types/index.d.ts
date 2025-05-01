declare module 'framp-relay' {
    import { Connection, PublicKey, Transaction } from '@solana/web3.js';
  
    interface SendGiftTokenParams {
      connection: Connection;
      walletPublicKey: PublicKey;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
      recipient: string;
      amount: number;
      tokenMint: string;
    }
  
    export function sendGiftToken(params: SendGiftTokenParams): Promise<string>;
  }
  
  // Add custom interfaces
  interface NFTMetadata {
    name: string;
    description: string;
    image: string;
  }
  
  interface TokenMints {
    [key: string]: string;
  }