
// src/components/GiftModal.tsx

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

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
  "Wife", "Husband", "Son", "Daughter", "Friend",
  "Mother", "Father", "Partner", "Mentor",
];

const defaultStories: Record<string, string> = {
  "Wine Bottle": "Toast to our beautiful moments together, each sip a memory cherished...",
  "Teddy Bear": "A soft reminder of my warm embrace, always here when you need comfort...",
  "Gold Pendant": "A symbol of our eternal connection, shining with every heartbeat we share...",
};

const estimatedFeeInSol = 0.001;
const TEST_WALLET_PUBLIC_KEY = new PublicKey(
  "98TcoasyWn7tsfo5JVpjXCy43eNfREBRerF8gUpJipSS"
);
const USD_TO_SOL_RATE = 0.08;

function convertUsdToSol(usdAmount: number): number {
  return usdAmount * USD_TO_SOL_RATE;
}

// List your RPC endpoints here:
const RPC_ENDPOINTS: string[] = [
  import.meta.env.VITE_SOLANA_RPC_URL,         // ← QuickNode (primary)
  import.meta.env.VITE_SOLANA_FALLBACK_RPC_URL // ← public devnet (fallback)
];

export function GiftModalOld({ item, isOpen, onClose }: GiftModalProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  const [selectedRelation, setSelectedRelation] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedToken, setSelectedToken] = useState<"SOL">("SOL");
  const [recipientInfo, setRecipientInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendGift = async () => {
    try {
      setError(null);

      // 1️⃣ Wallet & form checks
      if (!connected || !publicKey || !signTransaction) {
        setError("Wallet not ready. Please connect your wallet.");
        return;
      }
      if (!recipientInfo.name || !recipientInfo.phone || !recipientInfo.address) {
        setError("Please fill all recipient information.");
        return;
      }
      if (!selectedRelation) {
        setError("Please select relationship.");
        return;
      }

      // 2️⃣ Pick a live RPC endpoint
      let connection: Connection | null = null;
      for (const url of RPC_ENDPOINTS) {
        try {
          const conn = new Connection(url, "confirmed");
          await conn.getVersion();
          connection = conn;
          console.log(`✅ Using RPC endpoint: ${url}`);
          break;
        } catch {
          console.warn(`RPC ${url} failed; trying next…`);
        }
      }
      if (!connection) {
        setError("All RPC endpoints are down. Please try again later.");
        return;
      }

      // 3️⃣ Compute amounts
      const itemPriceUsd = parseFloat(item.price);
      if (isNaN(itemPriceUsd) || itemPriceUsd <= 0) {
        setError("Invalid item price.");
        return;
      }
      const amountInSol = convertUsdToSol(itemPriceUsd);
      const totalAmountSol = amountInSol + estimatedFeeInSol;
      const totalLamports = Math.round(totalAmountSol * LAMPORTS_PER_SOL);

      setLoading(true);

      // 4️⃣ Check balance
      const bal = await connection.getBalance(publicKey);
      if (bal < totalLamports) {
        setError(`Insufficient SOL. Need ${totalAmountSol} SOL, have ${(bal / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        return;
      }

      // 5️⃣ Get blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      // 6️⃣ Build tx
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TEST_WALLET_PUBLIC_KEY,
          lamports: totalLamports,
        })
      );

      // 7️⃣ Simulate (optional)
      const sim = await connection.simulateTransaction(tx);
      if (sim.value.err) {
        console.error("Simulation error:", sim.value.err);
        setError(`Simulation failed: ${JSON.stringify(sim.value.err)}`);
        return;
      }

      // 8️⃣ Sign with wallet
      let signedTx: Transaction;
      try {
        signedTx = await signTransaction(tx);
      } catch (err) {
        console.error("❌ signTransaction error:", err);
        setError("Transaction signing failed or was rejected.");
        return;
      }

      // 9️⃣ Send raw
      let signature: string;
      try {
        signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          { skipPreflight: false, preflightCommitment: "confirmed" }
        );
        console.log("🟢 Raw tx sent. Signature:", signature);
      } catch (err) {
        console.error("❌ sendRawTransaction error:", err);
        setError(`Network send error: ${(err as Error).message}`);
        return;
      }

      // 🔟 Confirm
      try {
        const conf = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed"
        );
        if (conf.value.err) throw conf.value.err;
        console.log("✅ Transaction confirmed!");
      } catch (err) {
        console.error("❌ confirmTransaction error:", err);
        setError("Confirmation failed; check Solana Explorer.");
        return;
      }

      // 1️⃣1️⃣ Save and close
      await saveOrder(signature, itemPriceUsd, amountInSol);
      resetForm();
      onClose();

    } catch (e) {
      console.error("❌ Unexpected:", e);
      setError((e as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const userEmail = localStorage.getItem("userEmail");

  const saveOrder = async (signature: string, itemPriceUsd: number, amountInSol: number) => {
    try {
      

      const order = {
        id: item.id,
        item: item.name,
        recipientName: recipientInfo.name,
        phone: recipientInfo.phone,
        address: recipientInfo.address,
        note: customMessage,
        relation: selectedRelation,
        txSignature: signature,
        price: itemPriceUsd,
        amountInSol,
        networkFee: estimatedFeeInSol,
        senderWallet: publicKey?.toBase58(),
        userEmail: userEmail,
        status: "pending",
      };

      const VITE_API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${VITE_API_URL}/Itiza_Delivery/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error saving order. Status: ${response.status}`, errorText);
      } else {
        const responseBody = await response.json();
        console.log("✅ Order saved successfully.", responseBody);
      }
    } catch (orderError) {
      console.error("Error saving order:", orderError);
      // Don't throw here - transaction was successful even if order saving failed
    }
  };

  const resetForm = () => {
    setRecipientInfo({ name: "", phone: "", address: "", note: "" });
    setSelectedRelation("");
    setCustomMessage("");
    setError(null);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-md w-full max-w-2xl m-4 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c]">
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[90vh] overflow-y-auto">
          <div className="aspect-square rounded-xl overflow-hidden">
            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-[#832c2c] mb-2">{item.name}</h3>
              <p className="text-[#832c2c]/70">
                ${item.price} (~{convertUsdToSol(parseFloat(item.price)).toFixed(3)} SOL) + ~{estimatedFeeInSol} SOL network fee
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
                {error.includes('503') || error.includes('Service unavailable') ? (
                  <div className="mt-2 text-xs text-red-600">
                    <p className="font-medium">RPC Network Issues:</p>
                    <p>• The public Solana devnet RPC is experiencing high traffic</p>
                    <p>• Try switching to a different RPC endpoint (Helius, QuickNode, etc.)</p>
                    <p>• Or wait a few minutes and try again</p>
                  </div>
                ) : null}
              </div>
            )}

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
                className="w-full p-3 rounded-xl border border-[#f6c1c1] focus:border-[#e47a7a]"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={recipientInfo.phone}
                onChange={(e) => setRecipientInfo({ ...recipientInfo, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#f6c1c1] focus:border-[#e47a7a]"
              />
              <textarea
                placeholder="Delivery Address"
                value={recipientInfo.address}
                onChange={(e) => setRecipientInfo({ ...recipientInfo, address: e.target.value })}
                className="w-full h-20 p-3 rounded-xl border border-[#f6c1c1] focus:border-[#e47a7a] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Token</Label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value as "SOL")}
                disabled
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="SOL">Solana (SOL)</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={onClose}
                className="flex-1 bg-[#fce8e6] text-[#832c2c] hover:bg-[#f6c1c1]"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendGift}
                disabled={loading || !connected}
                className="flex-1 bg-[#e47a7a] hover:bg-[#d76666] text-white disabled:opacity-50"
              >
                {loading ? "Sending..." : connected ? "Send Gift" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
