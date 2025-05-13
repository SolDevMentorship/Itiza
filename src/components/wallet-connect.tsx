"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Copy, CheckCircle2 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function WalletConnect() {
  const { address, isConnected, connect, disconnect } = useWallet()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  if (!isConnected) {
    return (
      <Button onClick={connect} className="bg-pink-600 hover:bg-pink-700">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100">
          <Wallet className="mr-2 h-4 w-4" />
          {address ? truncateAddress(address) : "Connected"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-red-500 hover:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
