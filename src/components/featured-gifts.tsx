"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, BellRingIcon as Ring, Coffee, Candy } from "lucide-react"

// Featured gift items data
const featuredGifts = [
    {
        id: 1,
        title: "Teddy Bear",
        description: "Soft and cuddly teddy bear for your loved one",
        icon: <Heart className="h-8 w-8 text-pink-200" />,
        image: "/placeholder.svg?height=120&width=120",
        color: "from-pink-500 to-rose-400",
    },
    {
        id: 2,
        title: "Wedding Ring",
        description: "Beautiful wedding ring for that special moment",
        icon: <Ring className="h-8 w-8 text-pink-200" />,
        image: "/placeholder.svg?height=120&width=120",
        color: "from-rose-400 to-red-400",
    },
    {
        id: 3,
        title: "Flowers",
        description: "Fresh flowers delivered to their doorstep",
        icon: <Coffee className="h-8 w-8 text-pink-200" />,
        image: "/placeholder.svg?height=120&width=120",
        color: "from-pink-400 to-purple-400",
    },
    {
        id: 4,
        title: "Chocolates",
        description: "Delicious box of premium chocolates",
        icon: <Candy className="h-8 w-8 text-pink-200" />,
        image: "/placeholder.svg?height=120&width=120",
        color: "from-purple-400 to-pink-500",
    },
]

export default function FeaturedGifts() {
    return (
        <div className="mt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl font-bold text-pink-800 mb-4">Featured Gifts</h2>
                <p className="text-lg text-pink-600 max-w-2xl mx-auto">
                    Explore our selection of special gifts for your loved ones. More options coming soon!
                </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {featuredGifts.map((gift) => (
                    <motion.div
                        key={gift.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: gift.id * 0.1 }}
                    >
                        <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full">
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className={`bg-gradient-to-r ${gift.color} p-4 relative`}>
                                    <div className="absolute top-2 right-2 bg-white/20 text-white text-xs font-medium py-1 px-2 rounded-full">
                                        Coming Soon
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                            {gift.icon}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-bold text-pink-800 mb-1">{gift.title}</h3>
                                    <p className="text-sm text-pink-600">{gift.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
