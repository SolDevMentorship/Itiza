"use client"

import { useState, ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { TokenAddress, TOKEN_LIST } from "@/config/tokens"
import { FrampRelayer } from "framp-relay-sdk"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"

const AIRBILLS_SECRET_KEY = import.meta.env.VITE_PUBLIC_AIRBILLS_SECRET_KEY
const SOLSCAN_API_KEY = import.meta.env.VITE_PUBLIC_SOLSCAN_API_KEY

interface GiftModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function GiftModal({ isOpen, onClose }: GiftModalProps) {
    const { connection } = useConnection()
    const wallet = useWallet()
    const { toast } = useToast()

    const [phoneNumber, setPhoneNumber] = useState("")
    const [amount, setAmount] = useState("")
    const [selectedToken, setSelectedToken] = useState<TokenAddress>(TOKEN_LIST[0].address)
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState("")

    const relayer = new FrampRelayer({
        solscanApiKey: SOLSCAN_API_KEY,
        airbillsSecretKey: AIRBILLS_SECRET_KEY,
    })

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value.replace(/[^\d]/g, ""))
    }

    const pollTransactionStatus = async (txId: string) => {
        const maxAttempts = 3
        let attempts = 0

        while (attempts < maxAttempts) {
            try {
                const status = await relayer.confirmAirtimeTransaction(txId)
                if (status?.success) return status
                await new Promise(resolve => setTimeout(resolve, 5000))
                attempts++
            } catch (error) {
                console.error("Polling error:", error)
                throw error
            }
        }
        throw new Error("Transaction status check timed out")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (!wallet.publicKey) {
            setMessage("Please connect your wallet first")
            return
        }

        if (!phoneNumber || !amount || Number(amount) <= 0) {
            setMessage("Please enter valid phone number and amount")
            return
        }

        setIsProcessing(true)

        try {
            const result = await relayer.sendAirtime({
                phoneNumber,
                amount: Number(amount),
                token: selectedToken,
                userAddress: wallet.publicKey.toString()
            })

            const latestBlockhash = await connection.getLatestBlockhash("confirmed")

            if (result.swapTransaction && result.airtimeTransaction) {
                const signedSwap = await wallet.signTransaction!(result.swapTransaction)
                const swapSignature = await connection.sendRawTransaction(signedSwap.serialize())
                await connection.confirmTransaction({ signature: swapSignature, ...latestBlockhash }, "confirmed")

                const signedAirtime = await wallet.signTransaction!(result.airtimeTransaction)
                const airtimeSignature = await connection.sendRawTransaction(signedAirtime.serialize())
                await connection.confirmTransaction({ signature: airtimeSignature, ...latestBlockhash }, "confirmed")
            } else {
                const transaction = Transaction.from(Buffer.from(result.txBase64, "base64"))
                const signed = await wallet.signTransaction!(transaction)
                const signature = await connection.sendRawTransaction(signed.serialize())
                await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed")
            }

            if (!result?.id) {
                throw new Error("Transaction ID not found in response");
            }

            await pollTransactionStatus(result.id)
            setMessage("Airtime sent successfully! 🎉")
        } catch (error) {
            console.error("Transaction error:", error)
            setMessage(error instanceof Error ? error.message : "Failed to send airtime")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        if (!isProcessing) {
            setPhoneNumber("")
            setAmount("")
            setSelectedToken(TOKEN_LIST[0].address)
            setMessage("")
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-pink-50">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-pink-800">
                        Send Airtime Gift
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Recipient's Phone Number</Label>
                        <Input
                            placeholder="1234567890"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            placeholder="10.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Token</Label>
                        <select
                            value={selectedToken}
                            onChange={(e) => setSelectedToken(e.target.value as TokenAddress)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {TOKEN_LIST.map((token) => (
                                <option key={token.address} value={token.address}>
                                    {token.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {message && (
                        <div className={`text-center ${message.includes("successfully") ? "text-green-600" : "text-red-500"
                            }`}>
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
                                "Send Gift"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}