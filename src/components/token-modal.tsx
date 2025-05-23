"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { invokeGiftToken } from "@/utils/helpers"
import { TokenListProvider } from "@solana/spl-token-registry"

interface GiftTokenModalProps {
    isOpen: boolean
    onClose: () => void
}

// 🟡 SOL mint address
const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function GiftTokenModal({ isOpen, onClose }: GiftTokenModalProps) {
    const { connection } = useConnection()
    const wallet = useWallet()

    const [giftAddress, setGiftAddress] = useState("")
    const [giftAmount, setGiftAmount] = useState("")
    const [selectedTokenMint, setSelectedTokenMint] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState("")
    const [tokenAccounts, setTokenAccounts] = useState<Array<{ mint: string, amount: number, symbol: string }>>([])
    const [solBalance, setSolBalance] = useState<number>(0)
    const feeRate = 0.05 // 5% fee
    const estimatedFeeInSol = 0.001 // Fixed fee in SOL (adjust based on relayer docs)

    // 🟢 Fetch user's token balances and SOL balance
    useEffect(() => {
        const fetchUserTokens = async () => {
            if (!wallet.publicKey) return

            try {
                // Fetch SOL balance
                const solBalance = await connection.getBalance(wallet.publicKey)
                setSolBalance(solBalance / 1e9)

                // Fetch SPL token balances
                const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
                    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
                })

                const filtered = accounts.value
                    .map((acc) => {
                        const parsed = acc.account.data.parsed.info
                        const tokenMint = parsed.mint
                        const tokenAmount = parseFloat(parsed.tokenAmount.uiAmountString)
                        const symbol = tokenMint.slice(0, 3).toUpperCase()

                        if (tokenAmount > 0) {
                            return {
                                mint: tokenMint,
                                amount: tokenAmount,
                                symbol
                            }
                        }
                        return null
                    })
                    .filter(Boolean) as Array<{ mint: string, amount: number, symbol: string }>

                setTokenAccounts(filtered)

                if (filtered.length > 0 && !selectedTokenMint) {
                    setSelectedTokenMint(filtered[0].mint)
                }
            } catch (error) {
                console.error("Failed to fetch token accounts:", error)
                setMessage("Error loading token balances")
            }
        }

        fetchUserTokens()
    }, [wallet.publicKey])

    // 🟢 Update balance based on selected token
    const selectedToken = tokenAccounts.find(t => t.mint === selectedTokenMint)
    const userBalance = selectedToken?.amount || 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (!wallet.connected || !wallet.publicKey) {
            setMessage("Please connect your wallet.")
            return
        }

        if (tokenAccounts.length === 0) {
            setMessage("You have no tokens to gift")
            return
        }

        if (!selectedTokenMint) {
            setMessage("No token selected for gifting")
            return
        }

        const amount = parseFloat(giftAmount)
        if (isNaN(amount) || amount <= 0) {
            setMessage("Please enter a valid amount")
            return
        }

        if (!giftAddress) {
            setMessage("Please enter a recipient address")
            return
        }

        // Validate SOL balance for fee
        if (solBalance < estimatedFeeInSol) {
            setMessage(`Insufficient SOL for transaction fees (need at least ${estimatedFeeInSol} SOL)`)
            return
        }

        setIsProcessing(true)

        try {
            const transferSuccessful = await invokeGiftToken(
                connection,
                wallet,
                amount,
                giftAddress,
                new PublicKey(SOL_MINT), // Pass SOL as mintToPayWith
                new PublicKey(selectedTokenMint),
            )

            if (transferSuccessful) {
                setMessage("Transfer completed. Tokens sent successfully! 🎉")
                setGiftAmount("")
                setGiftAddress("")
                // Refresh balances
                const newAccounts = [...tokenAccounts]
                const index = newAccounts.findIndex(t => t.mint === selectedTokenMint)
                if (index >= 0) {
                    newAccounts[index].amount -= amount
                    setTokenAccounts(newAccounts)
                }
            } else {
                setMessage("Error: Failed to send tokens.")
            }
        } catch (error) {
            console.error("Transfer error:", error)
            setMessage("Transfer error: Failed to send tokens.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        if (!isProcessing) {
            setGiftAddress("")
            setGiftAmount("")
            setMessage("")
            onClose()
        }
    }

    const calculatedFee = parseFloat(giftAmount) * feeRate || 0

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-pink-50">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-pink-800">
                        Send Token Gift
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {selectedToken && (
                        <div className="p-4 bg-gradient-to-r from-[#f6c1c1] to-[#fbe9e7] rounded-2xl text-center">
                            <h2 className="text-[#832c2c]/90 font-medium mb-2">Your Balance</h2>
                            <span className="text-2xl font-bold text-[#832c2c]">
                                {userBalance.toFixed(4)} {selectedToken.symbol}
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Recipient Address</Label>
                        <Input
                            placeholder="Enter wallet address"
                            value={giftAddress}
                            onChange={(e) => setGiftAddress(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Amount ({selectedToken?.symbol || "Token"})</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={giftAmount}
                            onChange={(e) => setGiftAmount(e.target.value)}
                            disabled={isProcessing || !tokenAccounts.length}
                        />
                    </div>

                    {tokenAccounts.length > 0 && (
                        <div className="space-y-2">
                            <Label>Token to Gift</Label>
                            <select
                                value={selectedTokenMint || ""}
                                onChange={(e) => setSelectedTokenMint(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {tokenAccounts.map((token) => (
                                    <option key={token.mint} value={token.mint}>
                                        {token.symbol} ({token.amount.toFixed(4)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {giftAmount && (
                        <div className="p-3 bg-white/50 rounded-xl text-[#832c2c]/80 text-sm space-y-1">
                            <p>Fee: {estimatedFeeInSol} SOL (fixed)</p>
                            <p>Recipient receives: {(parseFloat(giftAmount) - calculatedFee).toFixed(4)} {selectedToken?.symbol || "Token"}</p>
                        </div>
                    )}

                    {message && (
                        <div
                            className={`text-center ${message.includes("successfully") ? "text-green-600" : "text-red-500"
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isProcessing || !wallet.connected || tokenAccounts.length === 0}
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Send Tokens"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}