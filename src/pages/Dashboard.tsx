"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Phone, Coins} from "lucide-react"
import GiftModal from "@/components/gift-modal"
import TokenModal from "@/components/token-modal"
import UnwrapModal from "@/components/unwrap-modal"
import { useWallet } from "@/hooks/use-wallet"
import { motion } from "framer-motion"
import { Hearts } from "@/components/hearts"
import { Clouds } from "@/components/clouds"
import { Header } from "@/components/Header"
import { useNavigate } from "react-router-dom"
import { DatabaseService } from "@/lib/database"
import { GiftModalOld } from "@/components/GiftModal"
import type { Database } from "@/types/supabase"
type GiftType = Database["public"]["Tables"]["gifts"]["Row"]

export default function Dashboard() {
    const [selectedItem, setSelectedItem] = useState<GiftType | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false)
    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
    const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false)
    const [hasPendingGift, setHasPendingGift] = useState(false)
    const [featuredGifts, setFeaturedGifts] = useState<GiftType[]>([])
    const { isConnected, address } = useWallet()
    const navigate = useNavigate()

    useEffect(() => {
        const loadFeaturedGifts = async () => {
            try {
                const gifts = await DatabaseService.getAllGifts()
                setFeaturedGifts(gifts)
            } catch (error) {
                console.error('Error loading gifts:', error)
            }
        }

        loadFeaturedGifts()
    }, [])

    useEffect(() => {
        const checkPendingGifts = async () => {
            if (isConnected && address) {
                try {
                    // Create customer if they don't exist
                    const customer = await DatabaseService.getCustomerByWallet(address)
                    if (!customer) {
                        await DatabaseService.createCustomer({
                            name: `Anonymous-${address.slice(0, 6)}`,
                            email: null,
                            wallet_address: address,
                            blockchain_network: null,
                            phone: null,
                            street: null,
                            city: null,
                            state: null,
                            zip: null,
                            country: null
                        })
                    }

                    // Check for pending gifts
                    const orders = await DatabaseService.getCustomerOrders(customer?.customer_id || 0)
                    const hasPending = orders.some(order => order.status === 'pending')
                    setHasPendingGift(hasPending)
                } catch (error) {
                    console.error('Error checking gifts:', error)
                }
            }
        }

        checkPendingGifts()
        const interval = setInterval(checkPendingGifts, 30000)
        return () => clearInterval(interval)
    }, [isConnected, address])

    const handleOpenUnwrapModal = () => {
        setIsUnwrapModalOpen(true)
    }

    const handleItemClick = (item: GiftType) => {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    return (
        <div className="container mx-auto pb-8 bg-gradient-to-b">
            <Hearts />
            <Clouds />
            <Header hasPendingGift={hasPendingGift} onOpenUnwrapModal={handleOpenUnwrapModal} />

            <main className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-16"
                >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
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

                        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white w-full lg:w-[320px] shadow-xl">
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold">Order your Ryder One</h3>
                                        <p className="text-xs opacity-90">Discover something new!</p>
                                    </div>
                                    <img
                                        src="/images/RyderImage.png"
                                        alt="Ryder Product"
                                        width={57}
                                        height={57}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <p className="text-sm mb-4">
                                    Check out this amazing product from our trusted partner. Click to learn more!
                                </p>
                                <Button
                                    variant="ghost"
                                    className="mt-auto text-blue-100 hover:text-white hover:bg-white/10 text-sm px-3 py-2"
                                    onClick={() => window.open("https://ryder.id/products/ryder-one", "_blank")}
                                >
                                    Learn More →
                                </Button>
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

                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-[#832c2c]">
                            Featured Gifts
                        </h2>
                        <Button
                            variant="link"
                            className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                            onClick={() => navigate('/categories')}
                        >
                            View All →
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {featuredGifts.map((gift) => (
                            <Card
                                key={gift.gift_id}
                                onClick={() => handleItemClick(gift)}
                                className="group bg-white/40 hover:bg-white/60 transition-all cursor-pointer border-0 shadow-md hover:shadow-xl rounded-lg overflow-hidden hover:-translate-y-1"
                            >
                                <CardContent className="p-3">
                                    <div className="aspect-square mb-2 overflow-hidden rounded-md">
                                        <img
                                            src={gift.image_url || '/images/gift-placeholder.png'}
                                            alt={gift.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[#832c2c] font-medium text-sm mb-0.5 truncate">
                                            {gift.name}
                                        </p>
                                        <p className="text-[#832c2c]/70 text-xs">${gift.price}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>

            {selectedItem && (
                <GiftModalOld
                    item={{
                        ...selectedItem,
                        price: selectedItem?.price?.toString() || '0',
                        image_url: selectedItem?.image_url || undefined
                    }}
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
