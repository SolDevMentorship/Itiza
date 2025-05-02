"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Hearts } from "@/components/hearts"
import { Clouds } from "@/components/clouds"
import { Gift, Heart, Shield, Clock, ChevronRight, ArrowRight } from "lucide-react"
import HowItWorks from "@/components/how-it-works"
import LandingHeader from "@/components/landing-header"
import Footer from "@/components/footer"

export default function LandingPage() {
    const [activeTestimonial, setActiveTestimonial] = useState(0)

    const testimonials = [
        {
            id: 1,
            quote:
                "Itiza made sending a gift to my girlfriend so easy! She loved the surprise and the unwrapping experience was magical.",
            name: "Michael T.",
            role: "Happy Customer",
            avatar: "/placeholder.svg?height=60&width=60",
        },
        {
            id: 2,
            quote:
                "I was able to send airtime to my parents back home instantly. The process was seamless and they received it right away!",
            name: "Sarah K.",
            role: "Regular User",
            avatar: "/placeholder.svg?height=60&width=60",
        },
        {
            id: 3,
            quote:
                "The gift unwrapping animation is so cute! It makes receiving gifts feel special even when they're digital.",
            name: "David L.",
            role: "Gift Recipient",
            avatar: "/placeholder.svg?height=60&width=60",
        },
    ]

    const featuredGifts = [
        {
            id: 1,
            title: "Airtime Gift",
            description: "Send mobile airtime to anyone with just their phone number",
            image: "/placeholder.svg?height=200&width=200",
            available: true,
        },
        {
            id: 2,
            title: "Teddy Bear",
            description: "Soft and cuddly teddy bear for your loved one",
            image: "/placeholder.svg?height=200&width=200",
            available: false,
        },
        {
            id: 3,
            title: "Gift Card",
            description: "Digital gift cards for popular online stores",
            image: "/placeholder.svg?height=200&width=200",
            available: false,
        },
        {
            id: 4,
            title: "Crypto Token",
            description: "Send cryptocurrency tokens as gifts",
            image: "/placeholder.svg?height=200&width=200",
            available: false,
        },
    ]

    const benefits = [
        {
            id: 1,
            title: "Secure Gifting",
            description: "All gifts are secured with blockchain technology ensuring they reach the intended recipient",
            icon: <Shield className="h-10 w-10 text-pink-500" />,
        },
        {
            id: 2,
            title: "Instant Delivery",
            description: "Recipients can unwrap and enjoy their gifts immediately after you send them",
            icon: <Clock className="h-10 w-10 text-pink-500" />,
        },
        {
            id: 3,
            title: "Made with Love",
            description: "Our beautiful unwrapping experience makes every gift feel special and personal",
            icon: <Heart className="h-10 w-10 text-pink-500" />,
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
            <Hearts />
            <Clouds />

            <LandingHeader />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="lg:w-1/2 mb-12 lg:mb-0">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-pink-800 mb-6 leading-tight"
                            >
                                Send Gifts with Love <br />
                                <span className="text-rose-500">Anytime, Anywhere</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg text-gray-600 mb-8 max-w-lg"
                            >
                                Itiza makes gifting magical. Send airtime, tokens, and physical gifts to your loved ones with a
                                beautiful unwrapping experience they'll never forget.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Link href="/">
                                    <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-6 rounded-full text-lg font-medium">
                                        Send Your First Gift
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.7 }}
                                className="relative"
                            >
                                <div className="bg-white p-4 rounded-2xl shadow-xl transform rotate-3 relative z-10 overflow-hidden w-[500px] h-[700px]">
                                    <img
                                        src="/images/gold-ring.png"
                                        alt="Gift unwrapping experience"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-pink-100 p-4 rounded-lg shadow-lg transform -rotate-6 z-0">
                                    <Gift className="h-12 w-12 text-pink-500" />
                                </div>
                                <div className="absolute -top-4 -right-4 bg-rose-100 p-3 rounded-full shadow-lg z-20">
                                    <Heart className="h-8 w-8 text-rose-500" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Itiza */}
            <section className="py-20 bg-pink-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">Why Choose Itiza</h2>
                        <p className="text-lg text-pink-600 max-w-2xl mx-auto">
                            We've reimagined gifting for the digital age, making it more personal, secure, and magical.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                            >
                                <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold text-pink-800 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gradient-to-b from-white to-pink-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">What Our Users Say</h2>
                        <p className="text-lg text-pink-600 max-w-2xl mx-auto">
                            Don't just take our word for it. Here's what people love about Itiza.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative bg-white rounded-2xl shadow-lg p-8 md:p-10">
                            <div className="absolute -top-5 left-10 text-pink-500 text-6xl">"</div>
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: activeTestimonial === index ? 1 : 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={`${activeTestimonial === index ? "block" : "hidden"}`}
                                >
                                    <p className="text-lg md:text-xl text-gray-600 mb-6 pt-6">{testimonial.quote}</p>
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                            <img
                                                src={testimonial.avatar || "/placeholder.svg"}
                                                alt={testimonial.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-pink-800">{testimonial.name}</h4>
                                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-8">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTestimonial(index)}
                                    className={`w-3 h-3 rounded-full mx-2 ${activeTestimonial === index ? "bg-pink-500" : "bg-pink-200"}`}
                                    aria-label={`View testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Gifts */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">Featured Gifts</h2>
                        <p className="text-lg text-pink-600 max-w-2xl mx-auto">
                            Explore our selection of gifts perfect for any occasion and recipient.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {featuredGifts.map((gift, index) => (
                            <motion.div
                                key={gift.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="relative">
                                    <img src={gift.image || "/placeholder.svg"} alt={gift.title} className="w-full h-48 object-cover" />
                                    {!gift.available && (
                                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                Coming Soon
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-pink-800 mb-2">{gift.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{gift.description}</p>
                                    {gift.available ? (
                                        <Link href="/">
                                            <Button variant="outline" className="w-full border-pink-500 text-pink-500 hover:bg-pink-50">
                                                Send Now
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button variant="outline" className="w-full border-gray-300 text-gray-400" disabled>
                                            Coming Soon
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/gifts">
                            <Button variant="link" className="text-pink-600 font-medium text-lg group">
                                View All Gifts
                                <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-pink-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">How It Works</h2>
                        <p className="text-lg text-pink-600 max-w-2xl mx-auto">
                            Sending gifts with Itiza is simple, secure, and delightful. Here's how it works.
                        </p>
                    </motion.div>

                    <HowItWorks />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-4xl font-bold mb-6"
                    >
                        Ready to Send Your First Gift?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl mb-10 max-w-2xl mx-auto"
                    >
                        Join thousands of people who are making gifting more personal and magical with Itiza.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link href="/">
                            <Button className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-6 rounded-full text-lg font-medium">
                                Get Started Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
