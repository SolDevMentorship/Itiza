"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  signMessage: async () => "",
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  // Check if wallet was previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    if (savedAddress) {
      setAddress(savedAddress)
      setIsConnected(true)
    }
  }, [])

  const connect = async () => {
    try {
      // This is a mock implementation
      // In a real app, you would use a library like ethers.js or web3.js
      // to connect to the user's wallet

      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a mock address
      const mockAddress =
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")

      setAddress(mockAddress)

      setIsConnected(true)
      localStorage.setItem("walletAddress", mockAddress)

      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const signMessage = async (message: string): Promise<string> => {
    try {
      // This is a mock implementation
      // In a real app, you would use the wallet's signing functionality

      // Simulate signing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a mock signature
      const mockSignature =
        "0x" +
        Array(130)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")

      return mockSignature
    } catch (error) {
      console.error("Error signing message:", error)
      toast({
        title: "Signing failed",
        description: "Failed to sign message. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect, signMessage }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
