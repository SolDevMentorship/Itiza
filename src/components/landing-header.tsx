
// src/components/landing-header.tsx

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import WalletConnect from "@/components/wallet-connect";



interface LandingHeaderProps {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setShowLoginModal: Dispatch<SetStateAction<boolean>>;
  setShowSignUpModal: Dispatch<SetStateAction<boolean>>;
}

export default function LandingHeader({
  isLoggedIn,
  setIsLoggedIn,
  setShowLoginModal,
}: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProtectedNavigation = (path: string) => {
    if (isLoggedIn) {
      window.location.href = path;
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("authToken"); // optional if you're storing tokens
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/images/ItizaLogo.png"
              alt="Itiza Logo"
              width={65}
              height={65}
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleProtectedNavigation("/categories")}
              className={`font-medium ${
                isScrolled
                  ? "text-gray-700 hover:text-pink-600"
                  : "text-gray-800 hover:text-pink-500"
              }`}
            >
              Gifts
            </button>
            <button
              onClick={() => handleProtectedNavigation("/about")}
              className={`font-medium ${
                isScrolled
                  ? "text-gray-700 hover:text-pink-600"
                  : "text-gray-800 hover:text-pink-500"
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => handleProtectedNavigation("/contact")}
              className={`font-medium ${
                isScrolled
                  ? "text-gray-700 hover:text-pink-600"
                  : "text-gray-800 hover:text-pink-500"
              }`}
            >
              Contact Us
            </button>
          </nav>

          {/* Right Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                className="px-6 bg-white text-pink-600 hover:bg-pink-50"
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                className={`${
                  isScrolled
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    : "bg-white text-pink-600 hover:bg-pink-50"
                } px-6`}
              >
                Login
              </Button>
            )}

            <Link to="/">
              <Button
                className={`${
                  isScrolled
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
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white mt-4 py-4 px-2 rounded-lg shadow-lg">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => handleProtectedNavigation("/categories")}
                className="font-medium text-gray-700 hover:text-pink-600 px-4 py-2 hover:bg-pink-50 rounded-md"
              >
                Gifts
              </button>
              <button
                onClick={() => handleProtectedNavigation("/about")}
                className="font-medium text-gray-700 hover:text-pink-600 px-4 py-2 hover:bg-pink-50 rounded-md"
              >
                About Us
              </button>
              <button
                onClick={() => handleProtectedNavigation("/contact")}
                className="font-medium text-gray-700 hover:text-pink-600 px-4 py-2 hover:bg-pink-50 rounded-md"
              >
                Contact Us
              </button>

              <div className="border-t border-gray-200 my-2 pt-2 px-4">
                <WalletConnect />
                {isLoggedIn ? (
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-white text-pink-600 hover:bg-pink-50"
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    Login
                  </Button>
                )}
                <Link to="/" className="block mt-4">
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
  );
}
