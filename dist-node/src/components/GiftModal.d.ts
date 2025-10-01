import _React from "react";
export interface GiftItem {
    giftID?: number | string | null;
    merchantID?: string | null;
    name: string;
    price?: number | null;
    stockQuantity?: string | number | null;
    description?: string | null;
    img?: string | null;
    created_at?: string | null;
}
export interface GiftModalProps {
    item: GiftItem;
    isOpen: boolean;
    onClose: () => void;
}
export default function GiftModalOld({ item, isOpen, onClose }: GiftModalProps): _React.JSX.Element | null;
