export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-pink-400">Itiza</h3>
                        <p className="text-gray-400 mb-4">
                            Making gifting magical with blockchain technology. Send gifts with love, anytime, anywhere.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-pink-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-pink-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-pink-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-gray-400 hover:text-pink-400">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/categories" className="text-gray-400 hover:text-pink-400">
                                    Gifts
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="text-gray-400 hover:text-pink-400">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-gray-400 hover:text-pink-400">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Gift Categories</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-pink-400">
                                    Airtime
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-pink-400">
                                    Crypto Tokens
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-pink-400">
                                    Gift Cards
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-pink-400">
                                    Physical Gifts
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: itiza@gmail.com</li>
                            <li>Phone: +234 (0) 810-798-6162</li>
                            <li>Address: Nigeria</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">© 2025 Itiza. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-500 hover:text-pink-400 text-sm">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-500 hover:text-pink-400 text-sm">
                            Terms of Service
                        </a>
                        <a href="#" className="text-gray-500 hover:text-pink-400 text-sm">
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
