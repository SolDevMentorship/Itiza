import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPoints } from "@/components/ui/point";
import {
  pendant,
  goldring,
  teddybear,
  wristwatch,
  winebottle,
  velvetbox,
  // perfume,
} from "@/images";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { GiftModal } from "@/components/GiftModal";

const items = [
  {
    id: 1,
    name: "Gold Pendant",
    img: pendant,
    price: "500",
  },
  {
    id: 2,
    name: "Gold Ring",
    img: goldring,
    price: "450",
  },
  {
    id: 3,
    name: "Teddy Bear",
    img: teddybear,
    price: "300",
  },
  {
    id: 4,
    name: "Wristwatch",
    img: wristwatch,
    price: "750",
  },
  {
    id: 5,
    name: "Wine Bottle",
    img: winebottle,
    price: "600",
  },
  {
    id: 6,
    name: "Ring Pack",
    img: velvetbox,
    price: "1200",
  },
  // {
  //   id: 7,
  //   name: "Idol Perfume",
  //   img: perfume,
  //   price: "230",
  // },
];

export default function Dashboard() {
  // new states for modal and selected item
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loyaltyPoints, _setLoyaltyPoints] = useState(200);
  const [animatePoints, _setAnimatePoints] = useState(false);
  const navigate = useNavigate();

  // handlers for points animation
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // navigation handlers
  const handleGiftAirtime = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigating to gift-airtime");
    navigate("/gift-airtime", { replace: true });
  };

  const handleGiftToken = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigating to gift-token");
    navigate("/gift-token", { replace: true });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 min-h-screen pb-8 pt-20 overflow-y-auto">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Balance Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#832c2c]/90">
                Your Balance
              </h2>
              <AnimatedPoints points={loyaltyPoints} animate={animatePoints} />
            </div>
            <div className="bg-gradient-to-r from-[#f6c1c1] to-[#fbe9e7] rounded-2xl p-8 text-center shadow-lg">
              <span className="text-4xl md:text-5xl font-bold text-[#832c2c]">
                $1,300
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              onClick={handleGiftAirtime}
              className="bg-[#e47a7a] hover:bg-[#d76666] text-white rounded-xl py-4 text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Gift Airtime
            </Button>
            <Button
              onClick={handleGiftToken}
              className="bg-[#e47a7a] hover:bg-[#d76666] text-white rounded-xl py-4 text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Gift Token
            </Button>
          </div>

          {/* Featured Items */}
          <div>
            <h3 className="text-xl font-semibold text-[#832c2c]/90 mb-4">
              Featured Gifts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group bg-white/40 hover:bg-white/60 transition-all cursor-pointer border-0 shadow-md hover:shadow-xl rounded-xl overflow-hidden hover:-translate-y-1"
                >
                  <CardContent className="p-4">
                    <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[#832c2c] font-medium mb-1">
                        {item.name}
                      </p>
                      <p className="text-[#832c2c]/70 text-sm">${item.price}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        {/* Modal.. */}
        {selectedItem && (
          <GiftModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </Layout>
  );
}
