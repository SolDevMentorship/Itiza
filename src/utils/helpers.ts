// utils/helpers.ts
import { WalletContextState } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Transaction, Signer } from "@solana/web3.js"
import { FrampRelayer } from "framp-relay-sdk"
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token"

const AIRBILLS_SECRET_KEY = import.meta.env.VITE_PUBLIC_AIRBILLS_SECRET_KEY
const SOLSCAN_API_KEY = import.meta.env.VITE_PUBLIC_SOLSCAN_API_KEY

// 🟡 SOL mint address (fixed for fees)
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112")

export const invokeGiftToken = async (
    connection: Connection,
    wallet: WalletContextState,
    giftAmount: number, // e.g., 1.00 USDC (human-readable)
    recipientAddress: string, // Base58 string
    mintToPayWith: PublicKey = SOL_MINT,
    tokenMint: PublicKey, // Token to gift
): Promise<boolean> => {
    try {
        if (!wallet.publicKey || !wallet.signTransaction) {
            throw new Error("Wallet not connected")
        }

        // Convert amount to smallest unit (adjust based on token decimals)
        const tokenInfo = await connection.getTokenSupply(tokenMint)
        const decimals = tokenInfo.value.decimals
        const amountInSmallestUnit = Math.floor(giftAmount * Math.pow(10, decimals))

        // Initialize Framp Relayer
        const relayer = new FrampRelayer({
            solscanApiKey: SOLSCAN_API_KEY,
            airbillsSecretKey: AIRBILLS_SECRET_KEY,
        })

        // Get recipient's ATA (without creating it)
        const recipientPubkey = new PublicKey(recipientAddress);
        const mintPubkey = new PublicKey(tokenMint);

        const recipientATA = await getAssociatedTokenAddress(
            mintPubkey,
            recipientPubkey,
            false // allowOwnerOffCurve
        );

        // Check if ATA exists
        const accountInfo = await connection.getAccountInfo(recipientATA);
        console.log("Retrieved Recipient ATA:", recipientATA.toBase58());

        // If not, create the ATA
        if (!accountInfo) {
            const ataIx = createAssociatedTokenAccountInstruction(
                wallet.publicKey,      // payer
                recipientATA,          // ATA address to create
                recipientPubkey,       // token account owner
                mintPubkey,            // mint
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const ataTx = new Transaction().add(ataIx);

            // Set recentBlockhash for ATA transaction
            const { blockhash } = await connection.getLatestBlockhash("confirmed");
            ataTx.recentBlockhash = blockhash;
            ataTx.feePayer = wallet.publicKey;

            const signedAtaTx = await wallet.signTransaction(ataTx);
            const ataTxId = await connection.sendRawTransaction(signedAtaTx.serialize(), {
                skipPreflight: false,
            });
            await connection.confirmTransaction(ataTxId, "confirmed");
            console.log(`Created ATA: ${recipientATA.toBase58()} (tx: ${ataTxId})`);
        }

        // Get sender's ATA
        const senderPubkey = wallet.publicKey;
        const senderATA = await getAssociatedTokenAddress(
            mintPubkey,
            senderPubkey,
            false // allowOwnerOffCurve
        );

        // Check if sender's ATA exists
        const senderAccountInfo = await connection.getAccountInfo(senderATA);
        console.log("Retrieved Sender ATA:", senderATA.toBase58());

        // If not, create the sender's ATA
        if (!senderAccountInfo) {
            const senderAtaIx = createAssociatedTokenAccountInstruction(
                wallet.publicKey,      // payer
                senderATA,             // ATA address to create
                senderPubkey,          // token account owner
                mintPubkey,            // mint
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const senderAtaTx = new Transaction().add(senderAtaIx);

            // Set recentBlockhash for ATA transaction
            const { blockhash } = await connection.getLatestBlockhash("confirmed");
            senderAtaTx.recentBlockhash = blockhash;
            senderAtaTx.feePayer = wallet.publicKey;

            const signedSenderAtaTx = await wallet.signTransaction(senderAtaTx);
            const senderAtaTxId = await connection.sendRawTransaction(signedSenderAtaTx.serialize(), {
                skipPreflight: false,
            });
            await connection.confirmTransaction(senderAtaTxId, "confirmed");
            console.log(`Created sender ATA: ${senderATA.toBase58()} (tx: ${senderAtaTxId})`);
        }

        // Proceed with token transfer
        const { transaction } = await relayer.giftToken({
            walletPublicKey: wallet.publicKey,
            recipient: recipientATA.toBase58(),
            amount: amountInSmallestUnit,
            mintToPayWith: mintToPayWith.toBase58(),
            tokenMintToGift: tokenMint.toBase58(),
        })

        if (!transaction) {
            throw new Error("Failed to generate transaction from Framp Relayer")
        }

        console.log("Transaction created:", transaction)

        // Sign the transaction
        const signedTx = await wallet.signTransaction(transaction)

        // Submit the signed transaction
        const txId = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: true,
        })

        await connection.confirmTransaction(txId, "confirmed")

        console.log(`Transaction successful: ${txId}`)
        return true
    } catch (error) {
        console.error("Gift token transfer failed:", error)
        return false
    }
}
