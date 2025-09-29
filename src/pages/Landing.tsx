


// src/pages/landing.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hearts } from "@/components/hearts";
import { Clouds } from "@/components/clouds";
import { Gift, Heart, Shield, Clock, ArrowRight } from "lucide-react";
import LandingHeader from "@/components/landing-header";
import Footer from "@/components/footer";
import LoginModal from "@/pages/Login";
import SignUpModal from "@/pages/SignUp";
import ResetPasswordModal from "@/pages/resetPasswordModal"; // ensure path matches the file you added

// NOTE: This file includes an inline fetchCurrentUser implementation
// so the landing page can immediately attempt to hydrate auth state.

// const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

async function fetchCurrentUser(signal?: AbortSignal) {
  try {
    const resp = await fetch(`https://itiza-backend.vercel.app/api/authMe`, {
      method: "GET",
      credentials: "include", // important so cookie/session is sent
      signal,
      headers: { Accept: "application/json" },
    });
    if (!resp.ok) return null;
    const json = await resp.json().catch(() => null);
    return json?.user ?? null;
  } catch (err: any) {
    // Treat abort separately (caller cleans up), otherwise log
    if (err?.name === "AbortError") return null;
    console.warn("fetchCurrentUser error:", err);
    return null;
  }
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFullName, setUserFullName] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  // const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Immediately initialize auth on mount
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const user = await fetchCurrentUser(ac.signal);
      if (!user) {
        // not logged in
        setIsLoggedIn(false);
        setUserFullName("");
        return;
      }

      // Prefer fullName, then name, then email/customerID
      const name =
        (user.fullName as string | undefined) ??
        (user.name as string | undefined) ??
        (user.email as string | undefined) ??
        (user.customerID as string | undefined) ??
        "";

      setIsLoggedIn(true);
      setUserFullName(name);

      // persist commonly-used fields locally for convenience across the app
      try {
        if (user.customerID) localStorage.setItem("userCustomerID", user.customerID);
        if (user.email) localStorage.setItem("userEmail", user.email);
        if (name) localStorage.setItem("userFullName", name);
      } catch (e) {
        // ignore storage errors
      }
    })();

    return () => {
      ac.abort();
    };
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = userFullName
    ? userFullName.split(" ")[0].charAt(0).toUpperCase() + userFullName.split(" ")[0].slice(1)
    : "";

  const handleProtectedNavigation = (path: string) => {
    if (isLoggedIn) {
      window.location.href = path;
    } else {
      setShowLoginModal(true);
    }
  };

  const benefits = [
    {
      id: 1,
      title: "Secure Gifting",
      description:
        "All gifts are secured with blockchain technology ensuring they reach the intended recipient",
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Hearts />
      <Clouds />
      <LandingHeader
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowLoginModal={setShowLoginModal}
        setShowSignUpModal={setShowSignUpModal}
      />

      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              {isLoggedIn && (
                <motion.div
                  className="text-2xl md:text-3xl font-semibold text-left text-rose-500 mb-10 pl-2 md:pl-0 -mt-6 md:-mt-4"
                  style={{ fontFamily: "cursive" }}
                >
                  Hi, {firstName}
                </motion.div>
              )}
              <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-pink-800 mb-6 leading-tight">
                Send Gifts with Love <br />
                <span className="text-rose-500">Anytime, Anywhere</span>
              </motion.h1>
              <motion.p className="text-lg text-gray-600 mb-8 max-w-lg">
                Itiza makes gifting magical. Send airtime, tokens, and physical gifts to your loved ones with a beautiful unwrapping experience they'll never forget.
              </motion.p>
              <motion.div>
                <Button
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-6 rounded-full text-lg font-medium"
                  onClick={() => handleProtectedNavigation("/dashboard")}
                >
                  Send Your First Gift
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>

            <div className="lg:w-1/2">
              <motion.div className="relative">
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

      {/* benefits section placeholder */}
      <section className="py-20 bg-pink-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.id} className="bg-white rounded-xl p-6 shadow">
                <div className="mb-4">{b.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
        onSwitchToResetPasswordModal={() => {
          setShowLoginModal(false);
          setShowResetPasswordModal(true);
        }}
        setIsLoggedIn={(v) => {
          setIsLoggedIn(v);
          // if logged in, try to refresh user full name from server immediately
          if (v) {
            (async () => {
              const u = await fetchCurrentUser();
              if (u) {
                const name =
                  (u.fullName as string | undefined) ??
                  (u.name as string | undefined) ??
                  (u.email as string | undefined) ??
                  (u.customerID as string | undefined) ??
                  "";
                setUserFullName(name);
              }
            })();
          }
        }}
        setUserFullName={(name: string) => setUserFullName(name)}
      />

      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToLogin={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />

      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        prefillEmail={localStorage.getItem("prefillEmail") ?? undefined}
      />
    </div>
  );
}
