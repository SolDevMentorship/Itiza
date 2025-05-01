import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface UnclaimedGift {
  id: string;
  recipientType: string;
  giftName: string;
  image: string;
  value: string;
  message?: string;
  isUnwrapped: boolean;
}

export function GiftNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [unclaimedGifts, setUnclaimedGifts] = useState<UnclaimedGift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnclaimedGifts();
  }, []);

  const fetchUnclaimedGifts = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch("/api/unclaimed-gifts");
      const data = await response.json();
      setUnclaimedGifts(data);
    } catch (error) {
      console.error("Failed to fetch unclaimed gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnwrap = async (giftId: string) => {
    // Animate unwrapping
    setUnclaimedGifts((prev) =>
      prev.map((gift) =>
        gift.id === giftId ? { ...gift, isUnwrapped: true } : gift
      )
    );

    // Update backend (replace with your actual API call)
    try {
      await fetch(`/api/claim-gift/${giftId}`, { method: "POST" });
      // Remove from list after animation
      setTimeout(() => {
        setUnclaimedGifts((prev) => prev.filter((gift) => gift.id !== giftId));
      }, 2000);
    } catch (error) {
      console.error("Failed to claim gift:", error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Notification Dot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#832c2c] hover:text-[#632121] transition-colors"
      >
        <Bell size={24} />
        {unclaimedGifts.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2 h-2 bg-[#e47a7a] rounded-full"
          />
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4"
          >
            <h3 className="text-lg font-serif text-[#832c2c] mb-4">
              Unclaimed Gifts
            </h3>

            {loading ? (
              // Skeleton Loader
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-[#fce8e6] animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : unclaimedGifts.length === 0 ? (
              <p className="text-[#832c2c]/70 text-center py-4">
                No unclaimed gifts
              </p>
            ) : (
              <div className="space-y-4">
                {unclaimedGifts.map((gift) => (
                  <motion.div
                    key={gift.id}
                    layout
                    className="bg-white/50 rounded-xl p-4 shadow-md"
                  >
                    <div className="flex gap-4">
                      {/* Gift Image */}
                      <motion.div
                        className="relative w-24 h-24 rounded-lg overflow-hidden"
                        style={{
                          filter: gift.isUnwrapped ? "none" : "blur(10px)",
                        }}
                      >
                        <img
                          src={gift.image}
                          alt={gift.giftName}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>

                      {/* Gift Info */}
                      <div className="flex-1">
                        <p className="text-[#832c2c] font-medium mb-1">
                          Gift for {gift.recipientType}
                        </p>
                        {gift.isUnwrapped && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-[#832c2c]/70"
                          >
                            {gift.giftName} - ${gift.value}
                          </motion.p>
                        )}
                        {!gift.isUnwrapped && (
                          <button
                            onClick={() => handleUnwrap(gift.id)}
                            className="mt-2 px-4 py-1.5 bg-[#e47a7a] hover:bg-[#d76666] text-white text-sm rounded-full transition-colors"
                          >
                            Unwrap
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
