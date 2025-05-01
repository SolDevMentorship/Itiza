import React from "react";
import HomeHeader from "../components/home-ui/HomeHeader";
import Hero from "../components/home-ui/Hero";
import Features from "../components/home-ui/Features";
import HowItWorks from "../components/home-ui/HowItWorks";
import GiftCategories from "../components/home-ui/GiftCategories";
import Testimonials from "../components/home-ui/Testimonials";
import Footer from "../components/home-ui/Footer";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-itiza-cream">
      <HomeHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Hero />
        <Features />
        <HowItWorks />
        <GiftCategories />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
