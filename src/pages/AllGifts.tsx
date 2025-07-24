import React, { useState, useEffect } from "react";
import { DatabaseService } from "@/lib/database";
import type { Database } from "@/types/supabase";
type Gift = Database["public"]["Tables"]["gifts"]["Row"];
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GiftModalOld as GiftModal } from "@/components/GiftModal";

const ITEMS_PER_PAGE = 8;

const AllGifts: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const allGifts = await DatabaseService.getAllGifts();
        setGifts(allGifts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gifts:", error);
        setLoading(false);
      }
    };

    fetchGifts();
  }, []);

  useEffect(() => {
    const filtered = gifts.filter((gift) =>
      gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gift.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      false
    );
    setFilteredGifts(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, gifts]);

  const totalPages = Math.ceil(filteredGifts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGifts = filteredGifts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGiftClick = (gift: Gift) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header hasPendingGift={false} onOpenUnwrapModal={() => {}} />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-serif text-center text-gray-900 mb-6">
            Explore Our Gifts
          </h1>
          <div className="w-full max-w-md">
            <Input
              type="text"
              placeholder="Search gifts by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e47a7a] focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading gifts...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedGifts.map((gift) => (
                <div
                  key={gift.gift_id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleGiftClick(gift)}
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={gift.image_url || '/images/gift-placeholder.png'}
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-serif text-gray-900 mb-2">{gift.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{gift.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#832c2c] font-semibold">${gift.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`px-4 py-2 ${currentPage === page ? 'bg-[#e47a7a] text-white' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            )}

            {filteredGifts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No gifts found matching your search criteria.
              </div>
            )}
          </>
        )}

        {selectedGift && (
          <GiftModal
            item={{
              ...selectedGift,
              price: selectedGift?.price.toString(),
              img: selectedGift?.image_url || '/images/gift-placeholder.png',
              id: selectedGift.gift_id.toString(),
              
            }}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedGift(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AllGifts;
