"use client"

import { Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom";
import { CustomWalletMultiButton } from "./walletConnect";

interface HeaderProps {
    hasPendingGift: boolean
    onOpenUnwrapModal: () => void
}

export const Header: React.FC<HeaderProps> = ({ hasPendingGift, onOpenUnwrapModal }) => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

  return (
      <header className="container mx-auto p-4 flex justify-between items-center">
          <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
              role="button"
              aria-label="Go to home page"
          >
              <a href="/" className="flex items-center gap-2">
                  {/* Use Next.js Image component for the logo */}
                  <img
                      src="/images/ItizaLogo.png" // Path to your logo in public/images
                      alt="Itiza Logo"
                      width={65} // Adjust width as needed
                      height={65} // Adjust height as needed
                      className={`${isScrolled ? "" : ""}`} // Add any specific styling based on scroll if necessary
                  />
              </a>
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