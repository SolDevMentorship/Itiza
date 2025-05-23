// utils/helpers.ts
import { WalletContextState } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { FrampRelayer } from "framp-relay-sdk"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"

const AIRBILLS_SECRET_KEY = import.meta.env.VITE_PUBLIC_AIRBILLS_SECRET_KEY
const SOLSCAN_API_KEY = import.meta.env.VITE_PUBLIC_SOLSCAN_API_KEY

// 🟡 SOL mint address (fixed for fees)
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112")

export const invokeGiftToken = async (
    connection: Connection,
    wallet: WalletContextState,
    giftAmount: number, // e.g., 1.00 USDC (human-readable)
    recipientAddress: string, // Base58 string
    tokenMint: PublicKey, // Token to gift
    mintToPayWith: PublicKey = SOL_MINT // Fee token (default: SOL)
): Promise<boolean> => {
    try {
        if (!wallet.publicKey || !wallet.signTransaction) {
            throw new Error("Wallet not connected")
        }

        // Validate recipient address
        const recipientPubkey = new PublicKey(recipientAddress)
        if (!PublicKey.isOnCurve(recipientPubkey.toBytes())) {
            throw new Error("Invalid recipient address")
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

        // Ensure recipient ATA exists (Framp should handle this gaslessly)
        const recipientATA = getAssociatedTokenAddressSync(tokenMint, recipientPubkey)

        // Call giftToken with proper formatting
        const { transaction } = await relayer.giftToken({
            walletPublicKey: wallet.publicKey, // Must be Base58 string
            recipient: recipientATA.toBase58(), // Recipient token account
            amount: amountInSmallestUnit, // Converted to smallest unit
            tokenMintToGift: tokenMint.toBase58(), // Must be Base58 string
            mintToPayWith: mintToPayWith.toBase58(), // Must be Base58 string
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