// src/pages/Categories.tsx
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useLocation } from "react-router-dom";
import AISearchBar from "../utils/AISearchBar";
import GiftModal from "@/components/GiftModal";
// const API_BASE = import.meta.env.VITE_API_URL || "";
const Categories = () => {
    const location = useLocation();
    const locationState = location.state ?? {};
    const initialSearchResults = locationState.searchResults;
    const [allGifts, setAllGifts] = useState([]);
    const [searchResults, setSearchResults] = useState(initialSearchResults);
    const [query, setQuery] = useState(locationState.query ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Gift modal state
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [modalItem, setModalItem] = useState(null);
    useEffect(() => {
        // If navigated here with search results, prefer those (but still fetch all gifts for browsing)
        if (initialSearchResults && Array.isArray(initialSearchResults)) {
            setSearchResults(initialSearchResults);
            setQuery(locationState.query ?? "");
        }
        // Fetch all gifts for categories grid
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`https://itiza-backend.vercel.app/api/gifts`);
                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(`Failed to fetch gifts: ${res.status} ${txt}`);
                }
                const data = await res.json();
                if (!cancelled) {
                    // normalize shape
                    const mapped = (Array.isArray(data) ? data : []).map((r) => ({
                        id: r.id ?? r.giftID ?? r.giftID ?? "",
                        giftID: r.giftID ?? r.id ?? r.giftID ?? null,
                        merchantID: r.merchantID ?? null,
                        name: r.name ?? r.title ?? "",
                        description: r.description ?? null,
                        img: r.img ?? null,
                        price: typeof r.price === "number" ? r.price : r.price ? Number(r.price) : null,
                        stockQuantity: r.stockQuantity ?? null,
                        created_at: r.created_at ?? null,
                    }));
                    setAllGifts(mapped);
                }
            }
            catch (err) {
                if (!cancelled) {
                    console.error("Error fetching gifts:", err);
                    setError(err?.message ?? "Failed to load gifts");
                }
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // React to navigation with state (when AISearchBar navigates here)
    useEffect(() => {
        const state = location.state ?? {};
        if (state.searchResults && Array.isArray(state.searchResults)) {
            setSearchResults(state.searchResults);
            setQuery(state.query ?? "");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [location.state]);
    const clearSearch = () => {
        setSearchResults(undefined);
        setQuery("");
        // leave allGifts intact for browsing
    };
    // choose which set to render: searchResults (if present) else allGifts
    const renderList = searchResults && searchResults.length > 0 ? searchResults : allGifts;
    // Open gift modal for a given gift result. We coerce fields into the GiftItem shape expected by GiftModal.
    const openGiftModal = (gift) => {
        // Coerce giftID to string|number (GiftModal expects non-nullable giftID)
        const giftIDValue = gift.giftID != null ? gift.giftID : gift.id != null ? String(gift.id) : "";
        const modalPayload = {
            giftID: giftIDValue,
            merchantID: gift.merchantID ?? null,
            name: gift.name ?? "Untitled Gift",
            price: typeof gift.price === "number" ? gift.price : gift.price ? Number(gift.price) : null,
            stockQuantity: gift.stockQuantity ?? null,
            description: gift.description ?? null,
            img: gift.img ?? null,
            created_at: gift.created_at ?? null,
        };
        setModalItem(modalPayload);
        setIsGiftModalOpen(true);
    };
    const closeGiftModal = () => {
        setIsGiftModalOpen(false);
        setModalItem(null);
    };
    return (<Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto mb-8">
          <AISearchBar />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-serif text-gray-900">
            {searchResults && searchResults.length > 0
            ? `Search results${query ? ` for "${query}"` : ""}`
            : "Explore Our Gifts"}
          </h1>

          {searchResults && searchResults.length > 0 && (<div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {searchResults.length} result{searchResults.length > 1 ? "s" : ""}
              </div>
              <button onClick={clearSearch} className="text-sm py-2 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700" aria-label="Clear search results">
                Clear
              </button>
            </div>)}
        </div>

        {loading ? (<div className="py-20 text-center text-gray-500">Loading gifts…</div>) : error ? (<div className="py-20 text-center text-red-500">Error: {error}</div>) : renderList.length === 0 ? (<div className="py-20 text-center text-gray-500">No gifts available.</div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {renderList.map((gift) => {
                const key = String(gift.id ?? gift.giftID ?? gift.name ?? Math.random());
                return (<div key={key} role="button" tabIndex={0} onClick={() => openGiftModal(gift)} onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openGiftModal(gift);
                        }
                    }} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-200">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-50">
                    <img src={gift.img ?? "/images/placeholder.png"} alt={gift.name ?? "Gift"} className="object-cover w-full h-full" onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.png";
                    }}/>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate">{gift.name ?? "Untitled Gift"}</h3>
                    {gift.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{gift.description}</p>}
                    {typeof gift.price !== "undefined" && gift.price !== null && (<div className="mt-3 font-semibold text-pink-600">${Number(gift.price).toFixed(2)}</div>)}
                  </div>
                </div>);
            })}
          </div>)}
      </div>

      {/* Gift modal wired up */}
      {modalItem && (<GiftModal item={modalItem} isOpen={isGiftModalOpen} onClose={closeGiftModal}/>)}
    </Layout>);
};
export default Categories;
