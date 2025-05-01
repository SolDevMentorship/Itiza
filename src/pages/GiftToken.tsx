import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { invokeGiftToken } from "@/utils/helpers";
import { PublicKey } from "@solana/web3.js";
import { Layout } from "@/components/Layout";

type TokenSymbol = "SOL" | "USDC" | "USDT";

export default function GiftToken() {
  const [giftAddress, setGiftAddress] = useState<string>("");
  const [giftAmount, setGiftAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>("SOL");
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  const { connection } = useConnection();
  const wallet = useWallet();
  const feeRate = 0.05; // 5% fee

  useEffect(() => {
    const fetchUserBalance = async () => {
      const balance = await getSolBalance(wallet.publicKey!);
      setUserBalance(balance);
    };
    fetchUserBalance();
  }, [wallet.publicKey, selectedToken]);

  //get user balance
  const getSolBalance = async (publicKey: PublicKey) => {
    const lamports = await connection.getBalance(publicKey);
    return lamports / 1e9;
  };

  const handleGiftToken = async (): Promise<void> => {
    if (!wallet.connected || !wallet.publicKey) {
      setMessage("Please connect your wallet.");
      return;
    }

    if (isNaN(giftAmount) || giftAmount <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    if (!giftAddress) {
      setMessage("Please enter a recipient address");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const transferSuccessful = await invokeGiftToken(
        connection,
        wallet,
        giftAmount,
        giftAddress,
        selectedToken
      );

      if (transferSuccessful) {
        setUserBalance((prevBalance) => prevBalance - giftAmount);
        setMessage("Transfer completed. Tokens sent successfully! 🎉");
        setGiftAmount(0);
      } else {
        setMessage("Failed to send tokens.");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setMessage("Failed to send tokens.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      {/* Main content */}
      <div className="min-h-screen pt-20 px-4 relative z-1">
        <div className="max-w-lg mx-auto bg-white/30 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
          {/* Balance Display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-[#f6c1c1] to-[#fbe9e7] rounded-2xl text-center">
            <h2 className="text-[#832c2c]/90 font-medium mb-2">Your Balance</h2>
            <span className="text-3xl font-bold text-[#832c2c]">
              {(userBalance ?? 0).toFixed(4)} {selectedToken}
            </span>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Token Selection */}
            <div className="space-y-2">
              <label className="text-[#832c2c]/90 font-medium block">
                Pay with
              </label>
              <select
                value={selectedToken}
                onChange={(e) =>
                  setSelectedToken(e.target.value as TokenSymbol)
                }
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#e47a7a]/20 focus:border-[#e47a7a] focus:ring-2 focus:ring-[#e47a7a]/20 transition-all"
              >
                <option value="SOL">Solana (SOL)</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <label className="text-[#832c2c]/90 font-medium block">
                Token to gift
              </label>
              <input
                type="text"
                value={giftAddress}
                onChange={(e) => setGiftAddress(e.target.value)}
                placeholder="Enter recipient address"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#e47a7a]/20 focus:border-[#e47a7a] focus:ring-2 focus:ring-[#e47a7a]/20 transition-all"
              />
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <label className="text-[#832c2c]/90 font-medium block">
                Recipient Address
              </label>
              <input
                type="text"
                value={giftAddress}
                onChange={(e) => setGiftAddress(e.target.value)}
                placeholder="Enter recipient address"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#e47a7a]/20 focus:border-[#e47a7a] focus:ring-2 focus:ring-[#e47a7a]/20 transition-all"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-[#832c2c]/90 font-medium block">
                Amount
              </label>
              <input
                type="number"
                value={giftAmount || ""}
                onChange={(e) => setGiftAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#e47a7a]/20 focus:border-[#e47a7a] focus:ring-2 focus:ring-[#e47a7a]/20 transition-all"
              />
            </div>

            {/* Fee Display */}
            {giftAmount > 0 && (
              <div className="p-4 bg-white/50 rounded-xl text-[#832c2c]/80 text-sm">
                <p>
                  Fee: {(giftAmount * feeRate).toFixed(4)} {selectedToken}
                </p>
                <p>
                  Recipient gets: {(giftAmount * (1 - feeRate)).toFixed(4)}{" "}
                  {selectedToken}
                </p>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleGiftToken}
              disabled={isProcessing || !giftAddress || giftAmount <= 0}
              className="w-full bg-[#e47a7a] hover:bg-[#d76666] text-white rounded-xl py-4 font-medium transition-all shadow-md disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Send Tokens"}
            </Button>

            {/* Message Display */}
            {message && (
              <div
                className={`text-center font-medium ${
                  message.includes("successfully")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
