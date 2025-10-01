// src/components/SearchResults.tsx
import React from "react";
import { Link } from "react-router-dom";
const formatPrice = (price) => {
    if (price == null || price === "")
        return null;
    const n = typeof price === "number" ? price : Number(price);
    if (Number.isNaN(n))
        return null;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const SearchResults = ({ searchResults, onSelect }) => {
    return (<div className="absolute z-10 w-full bg-white border rounded-b-lg shadow-lg max-h-96 overflow-y-auto">
      {searchResults.length > 0 ? (searchResults.map((gift) => {
            // Defensive access: prefer DB-shaped fields, but tolerate common aliases if present.
            const giftId = gift.giftID ?? gift.id ?? gift.gift_id;
            const name = gift.name ?? gift.title ?? "";
            const imgSrc = gift.img ?? gift.url ?? gift.imageUrl ?? "";
            const merchant = gift.merchantID ?? gift.company ?? undefined;
            const priceStr = formatPrice(gift.price ?? gift.raw?.price ?? gift.price);
            const stock = gift.stockQuantity ?? gift.raw?.stockQuantity ?? gift.stockQuantity ?? null;
            const isOutOfStock = stock != null && Number(stock) <= 0;
            const content = (<div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200 space-x-4">
              {imgSrc ? (<img src={imgSrc} alt={name} className="w-12 h-12 object-cover rounded-md flex-shrink-0"/>) : (<div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                  No Image
                </div>)}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <div className="font-semibold truncate">{name}</div>
                  {priceStr && <div className="text-sm font-medium text-gray-700">₦{priceStr}</div>}
                </div>

                {gift.description && (<div className="text-sm text-gray-600 truncate">{gift.description}</div>)}

                <div className="flex items-center space-x-3 mt-1">
                  {merchant && <div className="text-xs text-gray-500">By {merchant}</div>}
                  {isOutOfStock ? (<div className="text-xs text-red-500">Out of stock</div>) : (stock != null && <div className="text-xs text-gray-500">{String(stock)} in stock</div>)}
                </div>
              </div>
            </div>);
            const key = String(giftId ?? name);
            if (onSelect) {
                return (<div key={key} onClick={() => onSelect(gift)} role="button" tabIndex={0} onKeyPress={(e) => {
                        if (e.key === "Enter")
                            onSelect(gift);
                    }}>
                {content}
              </div>);
            }
            // Default navigation uses the canonical giftID in the route.
            return (<Link key={key} to={`/product/${encodeURIComponent(String(giftId ?? ""))}`}>
              {content}
            </Link>);
        })) : (<div className="p-4 text-center text-gray-500">No results found</div>)}
    </div>);
};
export default SearchResults;
