// Updates the token selector to a searchable input dropdown

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
import tokenList from "@/utils/tokens.json"

interface GiftTokenModalProps {
    isOpen: boolean
    onClose: () => void
}

const SOL_MINT = "So11111111111111111111111111111111111111112"

export default function GiftTokenModal({ isOpen, onClose }: GiftTokenModalProps) {
    const { connection } = useConnection()
    const wallet = useWallet()

    const [giftAddress, setGiftAddress] = useState("")
    const [solAmount, setSolAmount] = useState("")
    const [selectedTokenMint, setSelectedTokenMint] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState("")
    const [solBalance, setSolBalance] = useState<number>(0)
    const [tokenQuery, setTokenQuery] = useState("")

    const estimatedFeeInSol = 0.001 // Fixed transaction fee

    useEffect(() => {
        const fetchBalance = async () => {
            if (!wallet.publicKey) return

            try {
                const balance = await connection.getBalance(wallet.publicKey)
                setSolBalance(balance / 1e9)

                if (!selectedTokenMint) {
                    setSelectedTokenMint(tokenList[0].mint)
                }
            } catch (error) {
                console.error("Error fetching SOL balance:", error)
                setMessage("Failed to fetch balance")
            }
        }

        fetchBalance()
    }, [wallet.publicKey])

    const selectedToken = tokenList.find(t => t.mint === selectedTokenMint)
    const tokenSymbol = selectedToken?.symbol || "Token"

    const filteredTokens = tokenList.filter(token =>
        token.symbol.toLowerCase().includes(tokenQuery.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (!wallet.connected || !wallet.publicKey) {
            setMessage("Please connect your wallet.")
            return
        }

        if (!selectedTokenMint) {
            setMessage("No token selected for gifting")
            return
        }

        const amount = parseFloat(solAmount)
        if (isNaN(amount) || amount <= 0) {
            setMessage("Please enter a valid SOL amount")
            return
        }

        if (!giftAddress) {
            setMessage("Please enter a recipient address")
            return
        }

        if (solBalance < amount + estimatedFeeInSol) {
            setMessage(`Insufficient SOL. Need ${amount + estimatedFeeInSol} SOL (includes ${estimatedFeeInSol} SOL fee)`)
            return
        }

        setIsProcessing(true)
        try {
            const transferSuccessful = await invokeGiftToken(
                connection,
                wallet,
                amount,
                giftAddress,
                new PublicKey(SOL_MINT),
                new PublicKey(selectedTokenMint)
            )

            if (transferSuccessful) {
                setMessage("Transfer initiated successfully! 🎉")
                setSolAmount("")
                setGiftAddress("")
            } else {
                setMessage("Error: Failed to process transfer.")
            }
        } catch (error) {
            console.error("Transfer error:", error)
            setMessage("Transfer error: Failed to process transaction.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        if (!isProcessing) {
            setGiftAddress("")
            setSolAmount("")
            setMessage("")
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-pink-50">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-pink-800">
                        Send Token Gift
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="p-4 bg-gradient-to-r from-[#f6c1c1] to-[#fbe9e7] rounded-2xl text-center">
                        <h2 className="text-[#832c2c]/90 font-medium mb-2">Your SOL Balance</h2>
                        <span className="text-2xl font-bold text-[#832c2c]">
                            {solBalance.toFixed(4)} SOL
                        </span>
                    </div>

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
                        <Label>Amount (SOL)</Label>
                        <Input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={solAmount}
                            onChange={(e) => setSolAmount(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Search Token Symbol</Label>
                        <Input
                            placeholder="Start typing a token symbol..."
                            value={tokenQuery}
                            onChange={(e) => setTokenQuery(e.target.value)}
                            disabled={isProcessing}
                        />
                        {filteredTokens.length > 0 && (
                            <select
                                value={selectedTokenMint || ""}
                                onChange={(e) => setSelectedTokenMint(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {filteredTokens.map((token) => (
                                    <option key={token.mint} value={token.mint}>
                                        {token.symbol}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {solAmount && (
                        <div className="p-3 bg-white/50 rounded-xl text-[#832c2c]/80 text-sm">
                            <p>Transaction Fee: {estimatedFeeInSol} SOL (fixed)</p>
                            <p className="mt-1">
                                Recipient will receive {tokenSymbol} based on current rates
                            </p>
                        </div>
                    )}

                    {message && (
                        <div className={`text-center ${message.includes("successfully") ? "text-green-600" : "text-red-500"}`}>
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
                            disabled={isProcessing || !wallet.connected || tokenList.length === 0}
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Send Gift"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
