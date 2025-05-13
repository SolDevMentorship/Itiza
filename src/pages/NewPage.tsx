"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Phone, Gem, Coins} from "lucide-react"
import GiftModal from "@/components/gift-modal"
import TokenModal from "@/components/token-modal"
import UnwrapModal from "@/components/unwrap-modal"
import { useWallet } from "@/hooks/use-wallet"
import { motion } from "framer-motion"
import { Hearts } from "@/components/hearts"
import { Clouds } from "@/components/clouds"
import { Header } from "@/components/Header"
import { useNavigate } from "react-router-dom";
import LandingHeader from "@/components/landing-header";
import { AnimatedPoints } from "@/components/ui/point";
import {
    pendant,
    goldring,
    teddybear,
    wristwatch,
    winebottle,
    velvetbox,
} from "@/images";

import { GiftModalOld } from "@/components/GiftModal";


const items = [
    {
        id: 1,
        name: "Gold Pendant",
        img: pendant,
        price: "500",
    },
    {
        id: 2,
        name: "Gold Ring",
        img: goldring,
        price: "450",
    },
    {
        id: 3,
        name: "Teddy Bear",
        img: teddybear,
        price: "300",
    },
    {
        id: 4,
        name: "Wristwatch",
        img: wristwatch,
        price: "750",
    },
    {
        id: 5,
        name: "Wine Bottle",
        img: winebottle,
        price: "600",
    },
    {
        id: 6,
        name: "Ring Pack",
        img: velvetbox,
        price: "1200",
    }
];
export default function Home() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false)
    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
    const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false)
    const [hasPendingGift, setHasPendingGift] = useState(false)
    const { address, isConnected, connect } = useWallet()
    const navigate = useNavigate();

    const [loyaltyPoints, _setLoyaltyPoints] = useState(0);
    const [animatePoints, _setAnimatePoints] = useState(false);

  // Check for pending gifts (this would connect to your backend in production)
  useEffect(() => {
    // Simulate checking for pending gifts
    const checkPendingGifts = async () => {
      if (isConnected) {
        // This would be an API call in production
        const hasPending = Math.random() > 0.5
        setHasPendingGift(hasPending)
      }
    }

    checkPendingGifts()
    // Set up interval to check periodically
    const interval = setInterval(checkPendingGifts, 30000)
    return () => clearInterval(interval)
  }, [isConnected])

    const handleOpenUnwrapModal = () => {
        setIsUnwrapModalOpen(true)
    }
    // handlers for points animation
    const handleItemClick = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="container mx-auto pb-8 bg-gradient-to-b">
            <Hearts />
            <Clouds />
            <Header hasPendingGift={hasPendingGift} onOpenUnwrapModal={handleOpenUnwrapModal} />

            <main className="container mx-auto px-4 py-12">
                {/* Improved Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-16"
                >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                        {/* Main Header Content */}
                        <div className="flex-1 space-y-6">
                            <h1 className="text-5xl font-bold text-pink-900 leading-tight">
                                Spread Joy with<br />
                                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                    Digital or Physical Gifting
                                </span>
                            </h1>
                            <p className="text-xl text-pink-800 max-w-2xl">
                                Connect your wallet and send thoughtful gifts through phone credits or tokens.
                                Recipients receive a magical unwrapping experience!
                            </p>
                        </div>

                        {/* Loyalty Points Card */}
                        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white w-full lg:w-[320px] shadow-xl">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold">Loyalty Points</h3>
                                        <p className="text-xs opacity-90">Available to redeem</p>
                                    </div>
                                    <Gem className="h-10 w-10 stroke-[1.5]" />
                                </div>
                                <div className="mt-4 text-center">
                                    <div className="text-3xl font-bold">
                                        <AnimatedPoints points={loyaltyPoints} animate={animatePoints} />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="mt-3 text-pink-100 hover:text-white hover:bg-white/10 text-sm px-3 py-2"
                                    >
                                        Redeem →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-6 text-white">
                <Phone className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Gift Airtime</h3>
                <p className="mb-4">Send airtime to friends and family with just their phone number.</p>
                <Button onClick={() => setIsGiftModalOpen(true)} className="bg-white text-pink-700 hover:bg-gray-100">
                  Send Airtime
                </Button>
              </div>
            </CardContent>
                    </Card>
                    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-rose-400 to-red-400 p-6 text-white">
                                <Coins className="h-12 w-12 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Gift Token</h3>
                                <p className="mb-4">Send cryptocurrency tokens as gifts to your loved ones.</p>
                                <Button onClick={() => setIsTokenModalOpen(true)} className="bg-white text-pink-700 hover:bg-gray-100">
                                    Send Tokens
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-6 text-white">
                <Gift className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Redeem Gift</h3>
                <p className="mb-4">Have a gift code? Redeem it here to unwrap your gift.</p>
                <Button onClick={() => setIsUnwrapModalOpen(true)} className="bg-white text-pink-700 hover:bg-gray-100">
                  Unwrap Gift
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

              {/* Featured Items */}
              <div>
                  <h3 className="text-xl font-semibold text-[#832c2c]/90 mb-4">
                      Featured Gifts
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {items.map((item) => (
                          <Card
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className="group bg-white/40 hover:bg-white/60 transition-all cursor-pointer border-0 shadow-md hover:shadow-xl rounded-xl overflow-hidden hover:-translate-y-1"
                          >
                              <CardContent className="p-4">
                                  <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                                      <img
                                          src={item.img}
                                          alt={item.name}
                                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                      />
                                  </div>
                                  <div className="text-center">
                                      <p className="text-[#832c2c] font-medium mb-1">
                                          {item.name}
                                      </p>
                                      <p className="text-[#832c2c]/70 text-sm">${item.price}</p>
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
                  </div>
              </div>
            </main>
            {/* Modal.. */}
            {selectedItem && (
                <GiftModalOld
                    item={selectedItem}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

          <GiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} />
          <TokenModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} />
      <UnwrapModal isOpen={isUnwrapModalOpen} onClose={() => setIsUnwrapModalOpen(false)} />
    </div>
  )
}
