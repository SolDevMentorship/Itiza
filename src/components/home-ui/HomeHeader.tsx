import React from "react";
import { Link } from "react-router-dom";

const HomeHeader: React.FC = () => {
  return (
    <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="font-serif text-2xl text-itiza-gold">
              ITIZA
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link
              to="/categories"
              className="text-gray-600 hover:text-itiza-gold transition-colors"
            >
              Gifts
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-itiza-gold transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-itiza-gold transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HomeHeader;
