"use client"

import { Gift, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom";
import { CustomWalletMultiButton } from "./walletConnect";

interface HeaderProps {
    hasPendingGift: boolean
    onOpenUnwrapModal: () => void
}

export const Header: React.FC<HeaderProps> = ({ hasPendingGift, onOpenUnwrapModal }) => {
  const navigate = useNavigate();

  return (
      <header className="container mx-auto p-4 flex justify-between items-center">
          <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
              role="button"
              aria-label="Go to home page"
          >
              <Gift className="h-8 w-8 text-pink-600" />
              <h1 className="text-2xl font-bold text-pink-800">Itiza</h1>
          </div>

          <div className="flex items-center gap-4">
              <div className="relative">
                  <Bell className="h-6 w-6 text-pink-600 cursor-pointer" onClick={onOpenUnwrapModal} />
                  {hasPendingGift && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500">
                          <span className="sr-only">Notification</span>
                      </Badge>
                  )}
              </div>
              <CustomWalletMultiButton />
          </div>
      </header>
  );
};