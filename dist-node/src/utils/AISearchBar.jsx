// src/components/AISearchBar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchResults from "./SearchResults";
// const API_BASE = import.meta.env.VITE_API_URL || "";
/**
 * Attempt to parse numeric-like strings to numbers but keep non-numeric strings as-is.
 * Returns number | string | null.
 */
const parseNumberIfPossible = (v) => {
    if (v == null || v === "")
        return null;
    if (typeof v === "number")
        return v;
    if (typeof v === "string") {
        // accept integers/floats
        if (/^-?\d+(\.\d+)?$/.test(v)) {
            const n = Number(v);
            return Number.isNaN(n) ? v : n;
        }
        return v;
    }
    return null;
};
const fetchGiftsFromServer = async (query) => {
    if (!query || query.trim().length < 1)
        return [];
    const q = query.trim();
    const url = `https://itiza-backend.vercel.app/api/giftsSearch?q=${encodeURIComponent(q)}`;
    console.log("[AISearchBar] fetching gifts URL:", url);
    const res = await fetch(url);
    if (!res.ok) {
        console.warn("Gift search failed:", res.status, await res.text().catch(() => ""));
        return [];
    }
    const data = await res.json().catch(() => []);
    if (!Array.isArray(data))
        return [];
    return data.map((r) => {
        // Determine raw giftID (could be number or string)
        const rawGiftID = r.giftID ?? r.id ?? r.gift_id ?? "";
        const parsedGiftID = parseNumberIfPossible(rawGiftID);
        // Ensure giftID is never null: convert null -> "" (string), otherwise keep number|string
        const giftID = parsedGiftID == null ? "" : parsedGiftID;
        const mapped = {
            // force giftID to match non-nullable type
            giftID,
            created_at: r.created_at ?? null,
            merchantID: r.merchantID ?? r.merchant_id ?? null,
            name: r.name ?? r.title ?? "",
            price: parseNumberIfPossible(r.price ?? r.raw?.price ?? null),
            stockQuantity: parseNumberIfPossible(r.stockQuantity ?? r.stock_quantity ?? r.raw?.stockQuantity ?? null),
            description: r.description ?? r.desc ?? null,
            img: r.img ?? r.imageUrl ?? r.image ?? null,
            // NOTE: Some versions of the SearchResults type may not include raw in the interface.
            // We keep raw on the object at runtime for downstream components, but cast it below
            // where TypeScript otherwise complains.
            ...(r ? { raw: r } : {}),
        };
        return mapped;
    });
};
const AISearchBar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchContainerRef = useRef(null);
    const searchTimeout = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                window.clearTimeout(searchTimeout.current);
            }
        };
    }, []);
    const runSearch = async (q) => {
        if (!q || q.trim().length < 1) {
            setResults([]);
            setShowResults(false);
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const res = await fetchGiftsFromServer(q);
            setResults(res);
            setShowResults(true);
        }
        catch (err) {
            console.error("Search error", err);
            setResults([]);
            setShowResults(false);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (searchTimeout.current)
            window.clearTimeout(searchTimeout.current);
        if (val.trim().length > 0) {
            // debounce 300ms
            searchTimeout.current = window.setTimeout(() => runSearch(val), 300);
        }
        else {
            setResults([]);
            setShowResults(false);
            setIsLoading(false);
        }
    };
    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setShowResults(false);
    };
    // When a search result is clicked, navigate to categories and pass the matching result(s)
    const handleSelectResult = (item) => {
        navigate("/categories", {
            state: {
                searchResults: [item],
                query: query.trim(),
            },
        });
        setShowResults(false);
    };
    // Lens/search button: navigate to categories and pass full results (or trigger a search then navigate)
    const handleLensClick = async () => {
        if (!query || query.trim().length === 0)
            return;
        setIsLoading(true);
        try {
            const res = await fetchGiftsFromServer(query);
            setResults(res);
            navigate("/categories", {
                state: {
                    searchResults: res,
                    query: query.trim(),
                },
            });
            setShowResults(false);
        }
        catch (err) {
            console.error("Lens search error", err);
        }
        finally {
            setIsLoading(false);
        }
    };
    // click outside to close results
    useEffect(() => {
        const onDocClick = (ev) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(ev.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);
    return (<div ref={searchContainerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <input type="text" value={query} onChange={handleSearchChange} placeholder="Search gifts by name..." aria-label="Search gifts" className="w-full px-4 py-2 pl-10 pr-12 text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" onKeyDown={(e) => {
            if (e.key === "Escape")
                clearSearch();
            if (e.key === "Enter") {
                // run immediate search and show results
                if (searchTimeout.current)
                    window.clearTimeout(searchTimeout.current);
                runSearch(query);
            }
        }}/>

        {isLoading ? (<Loader2 className="absolute left-3 top-3 text-blue-500 animate-spin" size={18}/>) : (<Search className="absolute left-3 top-3 text-gray-400" size={18}/>)}

        {/* Lens/Search button on the right */}
        <button onClick={handleLensClick} aria-label="Open results in categories" className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800 focus:outline-none">
          <Search size={18}/>
        </button>

        {query && (<button onClick={clearSearch} className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Clear search">
            <X size={18}/>
          </button>)}
      </div>

      {isLoading && (<div className="absolute z-10 w-full bg-white border rounded-b-lg shadow-lg">
          <div className="p-4 text-center text-gray-500">Searching...</div>
        </div>)}

      {showResults && !isLoading && (<SearchResults searchResults={results} onSelect={(selected) => {
                // selected is GiftSearchResult (DB-shaped). match by giftID (string/number) first
                const selId = selected.giftID;
                const matched = results.find((r) => {
                    if (r.giftID != null && selId != null)
                        return String(r.giftID) === String(selId);
                    // fallback to name match
                    return String(r.name ?? "").toLowerCase() === String(selected.name ?? "").toLowerCase();
                });
                if (matched) {
                    handleSelectResult(matched);
                    return;
                }
                // Fallback: navigate with a minimal GiftSearchResult-shaped object.
                // Use (selected as any).raw if available — cast to any to avoid TS complaints.
                const rawAny = selected.raw ?? null;
                navigate("/categories", {
                    state: {
                        searchResults: [
                            {
                                giftID: selected.giftID ?? "",
                                created_at: selected.created_at ?? null,
                                merchantID: selected.merchantID ?? null,
                                name: selected.name ?? selected.title ?? "",
                                price: selected.price ?? null,
                                stockQuantity: selected.stockQuantity ?? null,
                                description: selected.description ?? null,
                                img: selected.img ?? (rawAny ? rawAny.img : null) ?? null,
                                raw: rawAny,
                            },
                        ],
                    },
                });
            }}/>)}
    </div>);
};
export default AISearchBar;
