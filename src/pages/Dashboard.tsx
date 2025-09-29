// src/pages/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift as GiftIcon, Phone } from "lucide-react";
import GiftModal from "@/components/gift-modal";
import TokenModal from "@/components/token-modal";
import UnwrapModal from "@/components/unwrap-modal";
// import { useWallet } from "@/hooks/use-wallet";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GiftModalOld from "@/components/GiftModal";

interface GiftItem {
  giftID: number | string;
  merchantID: string | null;
  name: string;
  price: number | null;
  stockQuantity: string | number | null;
  description: string;
  img: string; // url or data uri
  created_at: string | null;
}

export default function Dashboard(): JSX.Element {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const limit = 6;
        // Vite env access via import.meta.env
        const urlBase = `${(import.meta as any).env.VITE_API_URL}/Itiza_Delivery/gifts`;
        const url = `${urlBase.replace(/\/$/, "")}?limit=${limit}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();

        console.log("API Response (raw):", Array.isArray(data) ? data.slice(0, 3) : data);

        const formatted: GiftItem[] = (Array.isArray(data) ? data : []).map((gift: any) => ({
          giftID: gift.giftID ?? gift.id,
          merchantID: gift.merchantID ?? null,
          name: gift.name ?? gift.title ?? "Untitled Gift",
          price:
            typeof gift.price === "number"
              ? gift.price
              : gift.price != null && gift.price !== ""
              ? Number(gift.price)
              : null,
          img: gift.img ?? "",
          description: gift.description ?? "",
          stockQuantity: gift.stockQuantity ?? gift.stock_quantity ?? null,
          created_at: gift.created_at ?? null,
        }));

        console.log("Formatted gifts (first items):", formatted.slice(0, 3));

        const onlySix = formatted.slice(0, limit);
        setGifts(onlySix);
      } catch (error) {
        console.error("Error fetching gifts:", error);
      }
    };

    fetchGifts();
  }, []);

  const handleOpenUnwrapModal = () => setIsUnwrapModalOpen(true);
  const handleItemClick = (gift: GiftItem) => {
    console.log("Selected gift:", gift);
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const truncate = (text?: string, wordLimit = 10) => {
    const safeText = String(text ?? "");
    const words = safeText.split(" ").filter(Boolean);
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : safeText;
  };

  return (
    <div>
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-5xl font-bold text-pink-900 leading-tight">
                Spread Joy with
                <br />
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Digital or Physical Gifting
                </span>
              </h1>
              <p className="text-xl text-pink-800 max-w-2xl">
                Connect your wallet and send thoughtful gifts through phone credits or tokens.
                Recipients receive a magical unwrapping experience!
              </p>
            </div>

            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white w-full lg:w-[320px] shadow-xl">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Order your Ryder One</h3>
                    <p className="text-xs opacity-90">Discover something new!</p>
                  </div>
                  <img
                    src="/images/RyderImage.png"
                    alt="Ryder Product"
                    width={57}
                    height={57}
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="text-sm mb-4">
                  Check out this amazing product from our trusted partner. Click to learn more!
                </p>
                <Button
                  variant="ghost"
                  className="mt-auto text-blue-100 hover:text-white hover:bg-white/10 text-sm px-3 py-2"
                  onClick={() => window.open("https://ryder.id/products/ryder-one", "_blank")}
                >
                  Learn More →
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-6 text-white">
                <Phone className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Gift Airtime</h3>
                <p className="mb-4">Send airtime to friends and family with just their phone number.</p>
                <Button onClick={() => setIsGiftModalOpen(true)} className="bg-white text-pink-700 hover:bg-gray-100">
                  Send Airtime
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-6 text-white">
                <GiftIcon className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Redeem Gift</h3>
                <p className="mb-4">Have a gift code? Redeem it here to unwrap your gift.</p>
                <Button onClick={() => handleOpenUnwrapModal()} className="bg-white text-pink-700 hover:bg-gray-100">
                  Unwrap Gift
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Gifts Grid (first 6 only) */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#832c2c]">Featured Gifts</h2>
            <Button variant="link" className="text-pink-600 hover:text-pink-800 text-sm font-medium" onClick={() => navigate("/categories")}>
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {gifts.map((gift) => {
              const qty = Number(gift.stockQuantity ?? 0);
              const outOfStock = Number.isFinite(qty) && qty <= 0;

              return (
                <Card
                  key={String(gift.giftID)}
                  onClick={() => handleItemClick(gift)}
                  className="group bg-white/40 hover:bg-white/60 transition-all cursor-pointer border-0 shadow-md hover:shadow-xl rounded-lg overflow-hidden hover:-translate-y-1 relative"
                >
                  <CardContent className="p-3">
                    <div className="relative aspect-square mb-2 overflow-hidden rounded-md">
                      <img
                        src={gift.img}
                        alt={gift.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-red-500 font-bold">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[#832c2c] font-medium text-sm mb-0.5 truncate">{gift.name}</p>
                      <p className="text-[#832c2c]/70 text-xs mb-1">{gift.price != null ? `$${gift.price}` : "—"}</p>
                      <p className="text-gray-700 text-xs h-12 overflow-hidden">{truncate(gift.description)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Modals */}
        {selectedGift && (
          <GiftModalOld
            item={{
              giftID: selectedGift.giftID,
              merchantID: selectedGift.merchantID,
              name: selectedGift.name,
              price: selectedGift.price,
              stockQuantity: selectedGift.stockQuantity,
              description: selectedGift.description,
              img: selectedGift.img,
              created_at: selectedGift.created_at,
            }}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        <GiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} />
        <TokenModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} />
        <UnwrapModal isOpen={isUnwrapModalOpen} onClose={() => setIsUnwrapModalOpen(false)} />
      </main>
    </div>
  );
}
