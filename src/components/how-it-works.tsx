"use client"

import { motion } from "framer-motion"

export default function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Connect & Send",
            description: "Connect your wallet, enter recipient's phone number and amount",
        },
        {
            id: 2,
            title: "Share Code",
            description: "Recipient receives a unique gift code",
        },
        {
            id: 3,
            title: "Unwrap & Enjoy",
            description: "They unwrap the gift and receive airtime instantly",
        },
    ]

    return (
        <div className="mt-20 text-center">
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-pink-800 mb-4"
            >
                How It Works
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {steps.map((step) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: step.id * 0.1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                            <span className="text-xl font-bold text-pink-700">{step.id}</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                        <p className="text-pink-600">{step.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
