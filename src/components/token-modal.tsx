"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { invokeGiftToken } from "@/utils/helpers"

type TokenSymbol = "SOL" | "USDC" | "USDT"

interface GiftTokenModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function GiftTokenModal({ isOpen, onClose }: GiftTokenModalProps) {
    const { connection } = useConnection()
    const wallet = useWallet()

    const [giftAddress, setGiftAddress] = useState("")
    const [giftAmount, setGiftAmount] = useState("")
    const [selectedToken, setSelectedToken] = useState<TokenSymbol>("SOL")
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState("")
    const [userBalance, setUserBalance] = useState(0)
    const feeRate = 0.05 // 5% fee

    useEffect(() => {
        const fetchUserBalance = async () => {
            if (wallet.publicKey) {
                const balance = await getSolBalance(wallet.publicKey)
                setUserBalance(balance)
            }
        }
        fetchUserBalance()
    }, [wallet.publicKey, selectedToken])

    const getSolBalance = async (publicKey: PublicKey) => {
        const lamports = await connection.getBalance(publicKey)
        return lamports / 1e9
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (!wallet.connected || !wallet.publicKey) {
            setMessage("Please connect your wallet.")
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

        setIsProcessing(true)

        try {
            const transferSuccessful = await invokeGiftToken(
                connection,
                wallet,
                amount,
                giftAddress,
                selectedToken
            )

            if (transferSuccessful) {
                setUserBalance(prev => prev - amount)
                setMessage("Transfer completed. Tokens sent successfully! 🎉")
                setGiftAmount("")
                setGiftAddress("")
            } else {
                setMessage("Failed to send tokens.")
            }
        } catch (error) {
            console.error("Transfer error:", error)
            setMessage("Failed to send tokens.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        if (!isProcessing) {
            setGiftAddress("")
            setGiftAmount("")
            setSelectedToken("SOL")
            setMessage("")
            onClose()
        }
    }

    const calculatedFee = parseFloat(giftAmount) * feeRate || 0
    const recipientReceives = parseFloat(giftAmount) - calculatedFee || 0

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-pink-50">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-pink-800">
                        Send Token Gift
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Balance Display */}
                    <div className="p-4 bg-gradient-to-r from-[#f6c1c1] to-[#fbe9e7] rounded-2xl text-center">
                        <h2 className="text-[#832c2c]/90 font-medium mb-2">Your Balance</h2>
                        <span className="text-2xl font-bold text-[#832c2c]">
                            {userBalance.toFixed(4)} {selectedToken}
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
                        <Label>Amount ({selectedToken})</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={giftAmount}
                            onChange={(e) => setGiftAmount(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Token Type</Label>
                        <select
                            value={selectedToken}
                            onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="SOL">Solana (SOL)</option>
                            <option value="USDC">USDC</option>
                            <option value="USDT">USDT</option>
                        </select>
                    </div>

                    {giftAmount && (
                        <div className="p-3 bg-white/50 rounded-xl text-[#832c2c]/80 text-sm space-y-1">
                            <p>Fee: {calculatedFee.toFixed(4)} {selectedToken}</p>
                            <p>Recipient receives: {recipientReceives.toFixed(4)} {selectedToken}</p>
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
                            disabled={isProcessing || !wallet.connected}
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