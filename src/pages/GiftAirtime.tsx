import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { wavyitem, flatgift } from "@/images";
import { TokenAddress, TOKEN_ADDRESSES, TOKEN_LIST } from "@/config/tokens";
import { FrampRelayer } from "framp-relay-sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
const AIRBILLS_SECRET_KEY = import.meta.env.VITE_PUBLIC_AIRBILLS_SECRET_KEY;
const SOLSCAN_API_KEY = import.meta.env.VITE_PUBLIC_SOLSCAN_API_KEY;

export default function GiftAirtime() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<TokenAddress>(
    TOKEN_ADDRESSES.USDC
  );
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { connection } = useConnection();

  //   const { connection } = useConnection();
  const wallet = useWallet();

  // Initialize Framp Relayer
  const relayer = new FrampRelayer({
    solscanApiKey: SOLSCAN_API_KEY,
    airbillsSecretKey: AIRBILLS_SECRET_KEY,
  });

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setPhoneNumber(value);
  };

  // 7. Poll for transaction status
  const pollTransactionStatus = async (txId: string) => {
    const maxAttempts = 3; // 1 minute total (12 * 5 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await relayer.confirmAirtimeTransaction(txId);
        console.log(`Poll attempt ${attempts + 1}:`, status);

        if (status?.success) {
          setMessage("Airtime sent successfully! 🎉");
          return status;
        } else if (!status?.success) {
          throw new Error("Airtime transaction failed");
        }

        // Wait 5 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error("Polling error:", error);
        throw error;
      }
    }

    throw new Error("Transaction status check timed out");
  };

  const handleGiftAirtime = async () => {
    if (!phoneNumber || amount <= 0) {
      setMessage("Please enter valid phone number and amount");
      return;
    }

    if (!wallet.publicKey) {
      setMessage("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const result = await relayer.sendAirtime({
        phoneNumber,
        amount,
        token: selectedToken,
        userAddress: wallet.publicKey.toString(),
      });

      console.log("API result:", result);

      // Get latest blockhash
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");

      // Handle non-USDC/USDT case with swap + airtime transactions
      if (result.swapTransaction && result.airtimeTransaction) {
        // 1. Sign and send swap transaction first
        const swapTx = result.swapTransaction;
        if (!wallet.signTransaction) {
          throw new Error("Wallet does not support transaction signing");
        }

        const signedSwap = await wallet.signTransaction(swapTx);
        const swapSignature = await connection.sendRawTransaction(
          signedSwap.serialize(),
          { maxRetries: 5 }
        );

        console.log("Swap transaction sent:", swapSignature);

        // Wait for swap confirmation
        const swapConfirmation = await connection.confirmTransaction(
          {
            signature: swapSignature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (swapConfirmation.value.err) {
          throw new Error(
            `Swap transaction failed: ${swapConfirmation.value.err}`
          );
        }

        // 2. Sign and send airtime transaction
        const airtimeTx = result.airtimeTransaction;
        const signedAirtime = await wallet.signTransaction(airtimeTx);
        const airtimeSignature = await connection.sendRawTransaction(
          signedAirtime.serialize(),
          { maxRetries: 5 }
        );

        console.log("Airtime transaction sent:", airtimeSignature);

        // Wait for airtime confirmation
        const airtimeConfirmation = await connection.confirmTransaction(
          {
            signature: airtimeSignature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (airtimeConfirmation.value.err) {
          throw new Error(
            `Airtime transaction failed: ${airtimeConfirmation.value.err}`
          );
        }
      } else {
        // Handle direct USDC/USDT transaction
        const transaction = Transaction.from(
          Buffer.from(result.txBase64, "base64")
        );
        if (!wallet.signTransaction) {
          throw new Error("Wallet does not support transaction signing");
        }

        const signed = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signed.serialize(),
          { maxRetries: 5 }
        );

        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
      }

      if (!result?.id) {
        throw new Error("Transaction ID not found in response");
      }

      setMessage("Transaction successful!");
      const relayStatus = await pollTransactionStatus(result.id);
      console.log("Relay status:", relayStatus);
    } catch (error) {
      console.error("Airtime gift error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to send airtime. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Get token symbol for display
  //   const getTokenLabel = (address: TokenAddress) => {
  //     const token = TOKEN_LIST.find((t) => t.address === address);
  //     return token?.label || "Unknown";
  //   };

  // Show loading state while processing
  //   const buttonText = isProcessing
  //     ? "Processing..."
  //     : `Gift ${amount} ${getTokenLabel(selectedToken)} Airtime`;

  return (
    <div className="min-h-screen h-screen overflow-x-auto overflow-y-hidden relative bg-gradient-to-b from-[#fce8e6] via-[#fbd9db] to-[#f9f1ec]">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={wavyitem}
          alt="Wavy fabric"
          className="absolute top-0 right-0 w-64 opacity-30 blur-sm transform scale-110 rotate-6"
        />
        <img
          src={flatgift}
          alt="Gift box"
          className="absolute bottom-4 left-4 w-40 opacity-40 blur-[1px]"
        />
      </div>

      {/* Main content */}
      <div className="min-h-screen pt-20 px-4 relative z-1">
        <div className="max-w-lg mx-auto bg-white/30 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="text-[#832c2c]/90 font-medium block">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#e47a7a]/20 focus:border-[#e47a7a] focus:ring-2 focus:ring-[#e47a7a]/20 transition-all"
                maxLength={15}
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-[#832c2c]/90 font-medium block">
                Amount
              </label>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#e47a7a]/20 focus:border-[#e47a7a] focus:ring-2 focus:ring-[#e47a7a]/20 transition-all"
              />
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <label className="text-[#832c2c]/90 font-medium block">
                Select Token
              </label>
              <select
                value={selectedToken}
                onChange={(e) =>
                  setSelectedToken(e.target.value as TokenAddress)
                }
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#e47a7a]/20 focus:border-[#e47a7a] focus:ring-2 focus:ring-[#e47a7a]/20 transition-all"
              >
                {TOKEN_LIST.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.label} ({token.address})
                  </option>
                ))}
              </select>
            </div>

            {/* Gift Button */}
            <Button
              onClick={handleGiftAirtime}
              disabled={isProcessing || !phoneNumber || amount <= 0}
              className="w-full bg-[#e47a7a] hover:bg-[#d76666] text-white rounded-xl py-4 font-medium transition-all shadow-md disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Gift Airtime"}
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
    </div>
  );
}
