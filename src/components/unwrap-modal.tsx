"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"
import { redeemGift } from "@/lib/gift-service"
import { useWallet } from "@/hooks/use-wallet"
import UnwrapAnimation from "./unwrap-animation"

interface UnwrapModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UnwrapModal({ isOpen, onClose }: UnwrapModalProps) {
  const [giftCode, setGiftCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUnwrapping, setIsUnwrapping] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [giftDetails, setGiftDetails] = useState<{ amount: number; phoneNumber: string } | null>(null)
  const { isConnected, address } = useWallet()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!giftCode) {
      toast({
        title: "Missing code",
        description: "Please enter a gift code",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      //// Verify the gift code
      //const result = await redeemGift({
      //  code: giftCode,
      //  recipientAddress: address || "",
      //})

      //// Start unwrapping animation
      //setGiftDetails(result)
      setIsLoading(false)
      setIsUnwrapping(true)

      // Simulate unwrapping animation time
      setTimeout(() => {
        setIsUnwrapping(false)
        setIsSuccess(true)
      }, 3000)
    } catch (error) {
      console.error("Error redeeming gift:", error)
      setIsLoading(false)
      toast({
        title: "Invalid code",
        description: "The gift code you entered is invalid or has already been redeemed",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    if (!isLoading && !isUnwrapping) {
      setGiftCode("")
      setIsSuccess(false)
      setGiftDetails(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-pink-50">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-pink-800">
            {isSuccess ? "Gift Unwrapped!" : isUnwrapping ? "Unwrapping Gift..." : "Redeem Your Gift"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess && giftDetails ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-6 flex flex-col items-center"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
              <p className="text-center mb-4">
                You've successfully redeemed {giftDetails.amount} in airtime for phone number {giftDetails.phoneNumber}.
              </p>
              <p className="text-sm text-gray-500 text-center">
                The airtime has been credited to your account and should be available immediately.
              </p>
            </motion.div>
          ) : isUnwrapping ? (
            <motion.div
              key="unwrapping"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 flex flex-col items-center"
            >
              <UnwrapAnimation />
              <p className="text-center mt-4">Unwrapping your gift... Please wait!</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="giftCode">Gift Code</Label>
                <Input
                  id="giftCode"
                  placeholder="Enter your gift code"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <p className="text-sm text-gray-500">Enter the gift code you received to unwrap your gift.</p>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !giftCode}
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Unwrap Gift"
                  )}
                </Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
