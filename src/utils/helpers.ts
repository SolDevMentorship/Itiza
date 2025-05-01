import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Signer } from "@solana/web3.js";
import { FrampRelayer } from "framp-relay-sdk";
const AIRBILLS_SECRET_KEY = import.meta.env.VITE_PUBLIC_AIRBILLS_SECRET_KEY;
const SOLSCAN_API_KEY = import.meta.env.VITE_PUBLIC_SOLSCAN_API_KEY;

export const invokeGiftToken = async (
    connection: Connection,
    wallet: WalletContextState,
    giftAmount: number,
    recipientAddress: string,
    tokenSymbol: string
  ): Promise<boolean> => {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      // Map token symbols to their mint addresses
      const tokenMints: { [key: string]: string } = {
        USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        SOL: "So11111111111111111111111111111111111111112",
        USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      };

      const tokenMint = tokenMints[tokenSymbol];
      if (!tokenMint) {
        throw new Error(`Unsupported token: ${tokenSymbol}`);
      }

      // Get recipient's ATA
      const recipientPubkey = new PublicKey(recipientAddress);
      const mintPubkey = new PublicKey(tokenMint);

      const recipientATA = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet as unknown as Signer, // payer
        mintPubkey, // mint
        recipientPubkey, // owner
        false, // allowOwnerOffCurve
        "confirmed" // commitment
      );

      console.log("Recipient ATA:", recipientATA.address.toBase58());

      //   (alias) sendGiftToken({ walletPublicKey, recipient, amount, tokenMint, }: GiftParams): Promise<{
      //     transaction: VersionedTransaction;
      //     txBase64: string;
      // }>
      // Initialize Framp Relayer
      const relayer = new FrampRelayer({
        solscanApiKey: SOLSCAN_API_KEY,
        airbillsSecretKey: AIRBILLS_SECRET_KEY,
      });

      const { transaction } = await relayer.giftToken({
        walletPublicKey: wallet.publicKey,
        recipient: recipientATA.address.toBase58(),
        amount: giftAmount,
        tokenMint,
      });

      console.log("Transaction created:", transaction);

      // sign the transaction
      // Sign the transaction using the wallet adapter
      // const signedTx = await wallet.signTransaction(transaction);

      // // Submit the signed transaction
      // const txId = await connection.sendRawTransaction(signedTx.serialize(), {
      //   skipPreflight: true,
      // });

      // await connection.confirmTransaction(txId, "confirmed");

      // console.log(`Transaction successful: ${txId}`);
      return true;
    } catch (error) {
      console.error("Gift token transfer failed:", error);
      return false;
    }
  };