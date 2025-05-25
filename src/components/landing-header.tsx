"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gift, Menu, X } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"

export default function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <Link href="/landing" className="flex items-center gap-2">
                        <Gift className={`h-8 w-8 ${isScrolled ? "text-pink-600" : "text-pink-500"}`} />
                        <h1 className={`text-2xl font-bold ${isScrolled ? "text-pink-800" : "text-pink-700"}`}>Itiza</h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/categories"
                            className={`font-medium ${isScrolled ? "text-gray-700 hover:text-pink-600" : "text-gray-800 hover:text-pink-500"
                                }`}
                        >
                            Gifts
                        </Link>
                        <Link
                            href="/about"
                            className={`font-medium ${isScrolled ? "text-gray-700 hover:text-pink-600" : "text-gray-800 hover:text-pink-500"
                                }`}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className={`font-medium ${isScrolled ? "text-gray-700 hover:text-pink-600" : "text-gray-800 hover:text-pink-500"
                                }`}
                        >
                            Contact Us
                        </Link>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/">
                            <Button
                                className={`${isScrolled
                                        ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                                        : "bg-white text-pink-600 hover:bg-pink-50"
                                    } px-6`}
                            >
                                Send a Gift
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white mt-4 py-4 px-2 rounded-lg shadow-lg">
                        <nav className="flex flex-col gap-4">
                            <Link
                                href="/gifts"
                                className="font-medium text-gray-700 hover:text-pink-600 px-4 py-2 hover:bg-pink-50 rounded-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Gifts
                            </Link>
                            <Link
                                href="/about"
                                className="font-medium text-gray-700 hover:text-pink-600 px-4 py-2 hover:bg-pink-50 rounded-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About Us
                            </Link>
                            <Link
                                href="/contact"
                                className="font-medium text-gray-700 hover:text-pink-600 px-4 py-2 hover:bg-pink-50 rounded-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link>
                            <div className="border-t border-gray-200 my-2 pt-2 px-4">
                                <WalletConnect />
                                <Link href="/" className="block mt-4">
                                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                                        Send a Gift
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
