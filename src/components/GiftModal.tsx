import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { DatabaseService } from "@/lib/database";
interface Gift {
  gift_id: number;
  name: string;
  price: string;
  image_url?: string;
}

interface GiftModalProps {
  item: Gift;
  isOpen: boolean;
  onClose: () => void;
}

const relationships = [
  "Wife", "Husband", "Son", "Daughter", "Friend",
  "Mother", "Father", "Partner", "Mentor",
];

const defaultStories: Record<string, string> = {
  "Wine Bottle": "Toast to our beautiful moments together, each sip a memory cherished...", 
  "Teddy Bear": "A soft reminder of my warm embrace, always here when you need comfort...",
  "Gold Pendant": "A symbol of our eternal connection, shining with every heartbeat we share...",
};

const estimatedFeeInSol = 0.001;
const TEST_WALLET_PUBLIC_KEY = new PublicKey("98TcoasyWn7tsfo5JVpjXCy43eNfREBRerF8gUpJipSS");

// Simulated USD to SOL conversion rate
const USD_TO_SOL_RATE = 0.08; // Example: 1 USD = 0.08 SOL

function convertUsdToSol(usdAmount: number): number {
  return usdAmount * USD_TO_SOL_RATE;
}

export function GiftModalOld({ item, isOpen, onClose }: GiftModalProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [selectedRelation, setSelectedRelation] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedToken, setSelectedToken] = useState<"SOL">("SOL");
  const [recipientInfo, setRecipientInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendGift = async () => {
    try {
      if (!connected || !publicKey) {
        console.log("Wallet not connected.");
        return;
      }

      if (!recipientInfo.name || !recipientInfo.phone || !recipientInfo.address) {
        console.log("Please fill all recipient information.");
        return;
      }

      if (!selectedRelation) {
        console.log("Please select relationship.");
        return;
      }

      const itemPriceUsd = Number(item.price);
      const amountInSol = convertUsdToSol(itemPriceUsd);
      const totalAmountSol = amountInSol + estimatedFeeInSol;
      const totalAmountLamports = Math.round(totalAmountSol * LAMPORTS_PER_SOL);

      const balanceLamports = await connection.getBalance(publicKey);
      if (balanceLamports < totalAmountLamports) {
        console.log("Insufficient SOL balance.");
        return;
      }

      setLoading(true);

      // Process blockchain transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TEST_WALLET_PUBLIC_KEY,
          lamports: totalAmountLamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      const confirmation = await connection.confirmTransaction(signature, "confirmed");

      if (confirmation.value.err) {
        console.log("There was an error while making payment.");
        setLoading(false);
        return;
      }

      // Create customer if they don't exist
      const customer = await DatabaseService.getCustomerByWallet(publicKey.toString());
      let customerId: number;

      if (!customer) {
        const newCustomer = await DatabaseService.createCustomer({
          name: `Anonymous-${publicKey.toString().slice(0, 6)}`,
          wallet_address: publicKey.toString(),
          email: null,
          phone: null,
          street: null,
          city: null,
          state: null,
          zip: null,
          country: null,
          blockchain_network: "Solana",
        });
        customerId = newCustomer.customer_id;
      } else {
        customerId = customer.customer_id;
      }

      // Create order
      const order = await DatabaseService.createOrder({
        customer_id: customerId,
        order_date: new Date().toISOString(),
        total_amount: itemPriceUsd,
        status: "pending",
        recipient_name: recipientInfo.name,
        recipient_street: recipientInfo.address,
        recipient_city: "", // These could be split from the address field if needed
        recipient_state: "",
        recipient_zip: "",
        recipient_country: "",
        gift_message: customMessage,
        tracking_number: null,
      }, [
        {
          gift_id: item.gift_id,
          quantity: 1,
          unit_price: itemPriceUsd,
        }
      ]);

      console.log("Order created successfully:", order);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error during gift sending:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-md w-full max-w-2xl m-4 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[90vh] overflow-y-auto">
          <div className="aspect-square rounded-xl overflow-hidden">
            <img
              src={item.image_url || '/images/gift-placeholder.png'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-[#832c2c] mb-2">{item.name}</h3>
              <p className="text-[#832c2c]/70">
                ${item.price} (~{convertUsdToSol(Number(item.price)).toFixed(3)} SOL) + ~{estimatedFeeInSol} SOL network fee
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {relationships.map((relation) => (
                <button
                  key={relation}
                  onClick={() => setSelectedRelation(relation)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedRelation === relation
                      ? "bg-[#e47a7a] text-white"
                      : "bg-[#fce8e6] text-[#832c2c] hover:bg-[#f6c1c1]"
                  }`}
                >
                  {relation}
                </button>
              ))}
            </div>

            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultStories[item.name] || "Write your heartfelt message..."}
              className="w-full h-24 p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a] resize-none"
            />

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient Name"
                value={recipientInfo.name}
                onChange={(e) => setRecipientInfo({ ...recipientInfo, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a]"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={recipientInfo.phone}
                onChange={(e) => setRecipientInfo({ ...recipientInfo, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a]"
              />
              <textarea
                placeholder="Delivery Address"
                value={recipientInfo.address}
                onChange={(e) => setRecipientInfo({ ...recipientInfo, address: e.target.value })}
                className="w-full h-20 p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] focus:ring-1 focus:ring-[#e47a7a] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Token</Label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value as "SOL")}
                disabled
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SOL">Solana (SOL)</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={onClose}
                className="flex-1 bg-[#fce8e6] text-[#832c2c] hover:bg-[#f6c1c1]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendGift}
                disabled={loading}
                className="flex-1 bg-[#e47a7a] hover:bg-[#d76666] text-white"
              >
                {loading ? "Sending..." : "Send Gift"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






























