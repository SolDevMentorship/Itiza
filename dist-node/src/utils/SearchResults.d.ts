import React from "react";
export interface GiftSearchResult {
    giftID: number | string;
    created_at?: string | null;
    merchantID?: string | null;
    name: string;
    price?: number | string | null;
    stockQuantity?: number | string | null;
    description?: string | null;
    img?: string | null;
}
interface SearchResultsProps {
    searchResults: GiftSearchResult[];
    onSelect?: (item: GiftSearchResult) => void;
}
declare const SearchResults: React.FC<SearchResultsProps>;
export default SearchResults;
