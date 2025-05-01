import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GiftModalProps {
  item: {
    id: string;
    name: string;
    img: string;
    price: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const relationships = [
  "Wife",
  "Husband",
  "Son",
  "Daughter",
  "Friend",
  "Mother",
  "Father",
  "Partner",
  "Mentor",
];

const defaultStories = {
  "Wine Bottle":
    "Toast to our beautiful moments together, each sip a memory cherished...",
  "Teddy Bear":
    "A soft reminder of my warm embrace, always here when you need comfort...",
  "Gold Pendant":
    "A symbol of our eternal connection, shining with every heartbeat we share...",
  "Gold Ring":
    "A circle of endless love and commitment, as timeless as the bond we hold...",
  "Gold Necklace":
    "A shining token of my affection, draping you in the warmth of my love...",
  "Ring Pack":
    "A treasure chest of beautiful memories, each ring a story of us written in gold...",
  "Silver Wrist Watch":
    "Every second with you is priceless—may this timepiece remind you of our journey together...",
  "Diamond Ring":
    "A sparkle that reflects the light in your eyes and the love in my heart...",
  "Luxury Chocolate Box":
    "A sweet collection of moments, crafted to mirror the joy you bring into my life...",
  "Velvet Jewelry Box":
    "Within this box lies a piece of my heart, a promise of love wrapped in elegance...",
  "Pearl Bracelet":
    "Delicate and pure, like the bond we share, timeless and true...",
  "Wavy Gift Box":
    "A wave of joy and surprises, just like every day spent with you...",
  "Flat Gift Pack":
    "A simple gesture, wrapped in endless gratitude and love...",
  Beads:
    "Tiny treasures woven together, just like the memories we’ve created side by side...",
};

export function GiftModal({ item, isOpen, onClose }: GiftModalProps) {
  const [selectedRelation, setSelectedRelation] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [recipientInfo, setRecipientInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white/90 backdrop-blur-md w-full max-w-2xl m-4 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[90vh] overflow-y-auto">
          {/* Image Section */}
          <div className="aspect-square rounded-xl overflow-hidden">
            <img
              src={item.img}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-[#832c2c] mb-2">
                {item.name}
              </h3>
              <p className="text-[#832c2c]/70">${item.price}</p>
            </div>

            {/* Relationship Selector */}
            <div className="flex flex-wrap gap-2">
              {relationships.map((relation) => (
                <button
                  key={relation}
                  onClick={() => setSelectedRelation(relation)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors
                    ${
                      selectedRelation === relation
                        ? "bg-[#e47a7a] text-white"
                        : "bg-[#fce8e6] text-[#832c2c] hover:bg-[#f6c1c1]"
                    }`}
                >
                  {relation}
                </button>
              ))}
            </div>

            {/* Message Section */}
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={
                defaultStories[item.name] || "Write your heartfelt message..."
              }
              className="w-full h-24 p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a] resize-none"
            />

            {/* Recipient Info */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient Name"
                value={recipientInfo.name}
                onChange={(e) =>
                  setRecipientInfo({ ...recipientInfo, name: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a]"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={recipientInfo.phone}
                onChange={(e) =>
                  setRecipientInfo({ ...recipientInfo, phone: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a]"
              />
              <textarea
                placeholder="Delivery Address"
                value={recipientInfo.address}
                onChange={(e) =>
                  setRecipientInfo({
                    ...recipientInfo,
                    address: e.target.value,
                  })
                }
                className="w-full h-20 p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={onClose}
                className="flex-1 bg-[#fce8e6] text-[#832c2c] hover:bg-[#f6c1c1]"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-[#e47a7a] hover:bg-[#d76666] text-white">
                Send Gift
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
