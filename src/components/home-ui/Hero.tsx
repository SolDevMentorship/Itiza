import React from "react";
import { useNavigate } from "react-router-dom";
import { winebottle, pendant, teddybear } from "@/images";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center pt-16">
      <div className="max-w-3xl">
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-6">
          When words aren't enough,{" "}
          <span className="text-itiza-gold">ITIZA</span> speaks in gifts.
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Send luxury gifts with heartfelt storylines and real-world delivery.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-itiza-gold text-white rounded-full hover:bg-opacity-90 transition-all"
          >
            Send Your First Gift
          </button>
          <button
            onClick={() => navigate("/categories")}
            className="px-8 py-3 border-2 border-itiza-gold text-itiza-gold rounded-full hover:bg-itiza-gold hover:text-white transition-all"
          >
            Explore Gifts
          </button>
        </div>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block w-1/3">
        <div className="grid grid-cols-2 gap-4">
          <img
            src={pendant}
            alt="Luxury Pendant"
            className="w-full h-48 object-cover rounded-lg shadow-lg"
          />
          <img
            src={winebottle}
            alt="Wine Bottle"
            className="w-full h-48 object-cover rounded-lg shadow-lg transform translate-y-12"
          />
          <img
            src={teddybear}
            alt="Teddy Bear"
            className="w-full h-48 object-cover rounded-lg shadow-lg transform -translate-y-8"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
