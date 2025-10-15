




// // src/components/GiftModal.tsx
// import _React, { useEffect, useMemo, useState } from "react";
// import { X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { useWallet } from "@solana/wallet-adapter-react";
// import {
//   Connection,
//   Transaction,
//   SystemProgram,
//   LAMPORTS_PER_SOL,
//   PublicKey,
// } from "@solana/web3.js";
// import { fetchCurrentUser } from "./fetchCurrentUser";
// import LoginModal from "../pages/Login";

// //
// // Types
// //
// export interface GiftItem {
//   giftID?: number | string | null;
//   merchantID?: string | null;
//   name: string;
//   price?: number | null;
//   stockQuantity?: string | number | null;
//   description?: string | null;
//   img?: string | null; // url or data uri
//   created_at?: string | null;
// }

// export interface GiftModalProps {
//   item: GiftItem;
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface OrderPayload {
//   trackingID?: string | null;
//   customerID?: string | null;
//   merchantID?: string | null;
//   giftID?: number | null;
//   paymentMethod?: string | null;
//   amount?: number | null;
//   networkFee?: number | null;
//   recipientName?: string | null;
//   recipientStreet?: string | null;
//   recipientCity?: string | null;
//   recipientState?: string | null;
//   recipientCountry?: string | null;
//   giftMessage?: string | null;
//   quantity?: number | null;
//   gift?: string | null;
//   status?: string | null;
//   recipientPhone?: string | null;
//   senderWallet?: string | null;
// }

// //
// // Helpers & constants
// //
// const relationships = [
//   "Wife",
//   "Husband",
//   "Son",
//   "Daughter",
//   "Friend",
//   "Mother",
//   "Father",
//   "Partner",
//   "Mentor",
// ];

// const USD_TO_SOL_RATE = 0.08;
// function convertUsdToSol(usdAmount: number): number {
//   return usdAmount * USD_TO_SOL_RATE;
// }

// const TEST_WALLET_PUBLIC_KEY = new PublicKey(
//   "98TcoasyWn7tsfo5JVpjXCy43eNfREBRerF8gUpJipSS"
// );

// const estimatedFeePercent = 0.025; // 2.5%

// const RPC_ENDPOINTS: string[] = [
//   import.meta.env.VITE_SOLANA_RPC_URL,
//   import.meta.env.VITE_SOLANA_FALLBACK_RPC_URL,
// ];

// export default function GiftModalOld({ item, isOpen, onClose }: GiftModalProps) {
//   const { publicKey, connected, signTransaction } = useWallet();

//   // Persisted customer info (from /auth/me or localStorage)
//   const [customerID, setCustomerID] = useState<string | null>(null);
//   const [customerEmail, setCustomerEmail] = useState<string | null>(null);
//   const [_customerPhone, setCustomerPhone] = useState<string | null>(null);

//   // recipient & order fields
//   const [selectedRelation, setSelectedRelation] = useState("");
//   const [recipientName, setRecipientName] = useState("");
//   const [recipientPhone, setRecipientPhone] = useState("");
//   const [recipientStreet, setRecipientStreet] = useState("");
//   const [recipientCity, setRecipientCity] = useState("");
//   const [recipientState, setRecipientState] = useState("");
//   const [recipientCountry, setRecipientCountry] = useState("");
//   const [giftMessage, setGiftMessage] = useState("");
//   const [quantity, setQuantity] = useState<number>(1);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // payment UI
//   const [showPaymentChoice, setShowPaymentChoice] = useState(false);
//   const [showCardModal, setShowCardModal] = useState(false);

//   // Login modal (auth) handling
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
//   const [pendingPaymentAfterLogin, setPendingPaymentAfterLogin] = useState(false);

//   // Card form inputs (kept for UI; actual card processing uses Paystack hosted checkout)
//   const [cardNumber, setCardNumber] = useState("");
//   const [cardName, setCardName] = useState("");
//   const [cardExpiry, setCardExpiry] = useState("");
//   const [cardCvv, setCardCvv] = useState("");

//   // Reset helper
//   const resetForm = () => {
//     setSelectedRelation("");
//     setRecipientName("");
//     setRecipientPhone("");
//     setRecipientStreet("");
//     setRecipientCity("");
//     setRecipientState("");
//     setRecipientCountry("");
//     setGiftMessage("");
//     setQuantity(1);
//     setCardNumber("");
//     setCardName("");
//     setCardExpiry("");
//     setCardCvv("");
//     setError(null);
//     setLoading(false);
//     setShowPaymentChoice(false);
//     setShowCardModal(false);
//     setPendingPaymentAfterLogin(false);
//     // Do not clear customer fields here so they persist
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   // when modal closes, reset form
//   useEffect(() => {
//     if (!isOpen) {
//       resetForm();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen]);

//   // Fetch current user when modal opens (prefill customer info). If no user, open login modal.
//   useEffect(() => {
//     if (!isOpen) return;

//     let mounted = true;
//     (async () => {
//       try {
//         const user = await fetchCurrentUser();
//         if (!mounted) return;
//         if (user) {
//           const id = (user.customerID || user.email || user.identifier || null) as string | null;
//           if (id) {
//             setCustomerID(id);
//             try {
//               localStorage.setItem("userCustomerID", id);
//             } catch {}
//           }
//           const email = (user.email as string | undefined) ?? null;
//           if (email) {
//             setCustomerEmail(email);
//             try {
//               localStorage.setItem("userEmail", email);
//             } catch {}
//           } else if (!email && id && id.includes("@")) {
//             setCustomerEmail(id);
//             try {
//               localStorage.setItem("userEmail", id);
//             } catch {}
//           }

//           const phone =
//             (user.phoneNumber as string | undefined) ??
//             (user.phone as string | undefined) ??
//             (user.phonenumber as string | undefined) ??
//             null;

//           if (phone) {
//             setCustomerPhone(phone);
//             try {
//               localStorage.setItem("userPhone", phone);
//             } catch {}
//           }

//           setIsLoggedIn(true);
//         } else {
//           // not authenticated — require login
//           setIsLoggedIn(false);
//           setShowLoginModal(true);
//         }
//       } catch (err) {
//         console.warn("fetchCurrentUser failed:", err);
//         setIsLoggedIn(false);
//         setShowLoginModal(true);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [isOpen]);

//   // Computed amounts
//   const unitPrice = Number(item.price ?? 0);
//   const computedAmount = Number((unitPrice * (quantity || 0)).toFixed(2));
//   const networkFee = Number((computedAmount * estimatedFeePercent).toFixed(2));
//   const totalPayable = Number((computedAmount + networkFee).toFixed(2));
//   const totalPayableSol = convertUsdToSol(totalPayable);

//   const getCustomerIDFromStorage = (): string | null =>
//     customerID || localStorage.getItem("userIdentifier") || localStorage.getItem("userCustomerID") || localStorage.getItem("userEmail") || null;

//   const getCustomerEmailFromStorage = (): string | null =>
//     customerEmail || getCustomerIDFromStorage() || localStorage.getItem("userEmail") || null;


//   //
//   // Recipient validation
//   //
//   const recipientValidationError = (): string | null => {
//     const trim = (s: string) => (s ?? "").trim();
//     if (!trim(recipientName)) return "Recipient name is required";
//     if (!trim(recipientPhone)) return "Recipient phone is required";
//     if (!/^\d{7,15}$/.test(recipientPhone)) return "Recipient phone must be digits only (7-15 digits)";
//     if (!trim(recipientStreet)) return "Recipient street is required";
//     if (!trim(recipientCity)) return "Recipient city is required";
//     if (!trim(recipientState)) return "Recipient state is required";
//     if (!trim(recipientCountry)) return "Recipient country is required";
//     if (!selectedRelation) return "Please select your relationship to the recipient";
//     if (!quantity || quantity <= 0) return "Quantity must be at least 1";
//     if (unitPrice <= 0) return "Invalid gift price";
//     return null;
//   };

//   const isRecipientFormValid = useMemo(() => recipientValidationError() === null, [
//     recipientName,
//     recipientPhone,
//     recipientStreet,
//     recipientCity,
//     recipientState,
//     recipientCountry,
//     selectedRelation,
//     quantity,
//     item.price,
//   ]);

//   // Handler to attempt to open payment choices — ensures validation + auth
//   const onAttemptOpenPaymentChoices = async () => {
//     setError(null);

//     const valErr = recipientValidationError();
//     if (valErr) {
//       setError(valErr);
//       return;
//     }

//     if (!isLoggedIn) {
//       try {
//         const user = await fetchCurrentUser();
//         if (user) {
//           const id = (user.customerID || user.email || user.identifier || null) as string | null;
//           if (id) {
//             setCustomerID(id);
//             try {
//               localStorage.setItem("userCustomerID", id);
//             } catch {}
//           }
//           const email = (user.email as string | undefined) ?? null;
//           if (email) {
//             setCustomerEmail(email);
//             try {
//               localStorage.setItem("userEmail", email);
//             } catch {}
//           }
//           const phone =
//             (user.phoneNumber as string | undefined) ??
//             (user.phone as string | undefined) ??
//             (user.phonenumber as string | undefined) ??
//             null;
//           if (phone) {
//             setCustomerPhone(phone);
//             try {
//               localStorage.setItem("userPhone", phone);
//             } catch {}
//           }
//           setIsLoggedIn(true);
//           setShowPaymentChoice(true);
//           return;
//         }
//       } catch (err) {
//         console.warn("fetchCurrentUser failed on payment attempt:", err);
//       }

//       // Not authenticated — show login modal and continue after success
//       setPendingPaymentAfterLogin(true);
//       setShowLoginModal(true);
//       return;
//     }

//     setShowPaymentChoice(true);
//   };

//   // After login modal closes (or user logged in) — re-check auth and continue pending flow if any
//   useEffect(() => {
//     if (!showLoginModal) {
//       (async () => {
//         if (!isLoggedIn) {
//           const user = await fetchCurrentUser();
//           if (user) {
//             const id = (user.customerID || user.email || user.identifier || null) as string | null;
//             if (id) {
//               setCustomerID(id);
//               try {
//                 localStorage.setItem("userCustomerID", id);
//               } catch {}
//             }
//             const email = (user.email as string | undefined) ?? null;
//             if (email) {
//               setCustomerEmail(email);
//               try {
//                 localStorage.setItem("userEmail", email);
//               } catch {}
//             }
//             const phone =
//               (user.phoneNumber as string | undefined) ??
//               (user.phone as string | undefined) ??
//               (user.phonenumber as string | undefined) ??
//               null;
//             if (phone) {
//               setCustomerPhone(phone);
//               try {
//                 localStorage.setItem("userPhone", phone);
//               } catch {}
//             }
//             setIsLoggedIn(true);

//             if (pendingPaymentAfterLogin) {
//               setPendingPaymentAfterLogin(false);
//               setShowPaymentChoice(true);
//             }
//           }
//         }
//       })();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showLoginModal]);

//   //
//   // Orders + payments (saveOrderToBackend, resolveGiftID, handlers)
//   //
//   const saveOrderToBackend = async (payload: OrderPayload) => {
//     try {
//       console.log("[orders] saving payload:", payload);

//       const resp = await fetch(`https://itiza-backend.vercel.app/api/order`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       if (!resp.ok) {
//         let bodyText = "";
//         let bodyJson: any = null;
//         try {
//           bodyJson = await resp.json();
//         } catch (_) {
//           bodyText = await resp.text();
//         }
//         console.error("Order save failed:", resp.status, bodyJson ?? bodyText);
//         throw new Error(
//           `Database insert failed (status ${resp.status}) - ${JSON.stringify(bodyJson ?? bodyText)}`
//         );
//       }

//       const body = await resp.json().catch(() => ({}));
//       console.log("Order save response:", body);
//       return body;
//     } catch (err: any) {
//       console.error("Error saving order:", err);
//       throw err;
//     }
//   };

//   const resolveGiftID = (): number => {
//     const raw = item.giftID;
//     if (raw === undefined || raw === null) {
//       throw new Error("giftID is missing on the item. Ensure the selected gift has a numeric giftID.");
//     }
//     if (typeof raw === "number") {
//       if (!Number.isFinite(raw)) throw new Error("giftID is not a finite number");
//       return Math.floor(raw);
//     }
//     const parsed = Number(String(raw).trim());
//     if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
//       throw new Error(`giftID is not numeric: ${String(raw)}`);
//     }
//     return Math.floor(parsed);
//   };

//   const validateOrderInputs = (): string | null => recipientValidationError();

//   // Crypto payment handler (unchanged)
//   const handleCryptoPayment = async () => {
//   setError(null);
//   const validationErr = validateOrderInputs();
//   if (validationErr) {
//     setError(validationErr);
//     return;
//   }

//   if (!connected || !publicKey || !signTransaction) {
//     setError("Please connect your wallet to pay with crypto.");
//     return;
//   }

//   // Check if already processing to prevent double-clicks
//   if (loading) {
//     console.log("Payment already in progress, ignoring duplicate request");
//     return;
//   }

//   let connection: Connection | null = null;
//   for (const url of RPC_ENDPOINTS) {
//     try {
//       const conn = new Connection(url, "confirmed");
//       await conn.getVersion();
//       connection = conn;
//       break;
//     } catch (e) {
//       console.warn("RPC failed, trying next", url);
//     }
//   }
//   if (!connection) {
//     setError("No RPC endpoints available. Try again later.");
//     return;
//   }

//   const totalLamports = Math.round(totalPayableSol * LAMPORTS_PER_SOL);

//   try {
//     setLoading(true);

//     const bal = await connection.getBalance(publicKey);
//     if (bal < totalLamports) {
//       setError(`Insufficient SOL. Need ${totalPayableSol.toFixed(6)} SOL, have ${(bal / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
//       setLoading(false);
//       return;
//     }

//     // IMPORTANT: Get fresh blockhash right before creating transaction
//     const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    
//     const tx = new Transaction({ 
//       recentBlockhash: blockhash, 
//       feePayer: publicKey 
//     }).add(
//       SystemProgram.transfer({
//         fromPubkey: publicKey,
//         toPubkey: TEST_WALLET_PUBLIC_KEY,
//         lamports: totalLamports,
//       })
//     );

//     // Sign the transaction
//     let signedTx: Transaction;
//     try {
//       signedTx = await signTransaction(tx);
//     } catch (err) {
//       console.error("signTransaction error", err);
//       setError("Transaction signing failed or was rejected");
//       setLoading(false);
//       return;
//     }

//     // Send transaction with skipPreflight: true to avoid simulation issues
//     let signature: string;
//     try {
//       signature = await connection.sendRawTransaction(signedTx.serialize(), {
//         skipPreflight: true, // Changed from false to true
//         maxRetries: 3,
//       });
//       console.log("Sent tx signature:", signature);
//     } catch (err: any) {
//       console.error("sendRawTransaction error", err);
      
//       // Check if it's a duplicate transaction error
//       if (err?.message?.includes("already been processed")) {
//         setError("This transaction was already sent. Please wait for confirmation.");
//       } else {
//         setError("Network error sending transaction");
//       }
//       setLoading(false);
//       return;
//     }

//     // Confirm transaction
//     try {
//       const conf = await connection.confirmTransaction(
//         { signature, blockhash, lastValidBlockHeight }, 
//         "confirmed"
//       );
      
//       if (conf.value?.err) {
//         console.error("confirmTransaction err:", conf.value.err);
//         setError("Transaction confirmation failed");
//         setLoading(false);
//         return;
//       }
//     } catch (err) {
//       console.error("confirmTransaction thrown:", err);
//       setError("Transaction confirmation failed");
//       setLoading(false);
//       return;
//     }

//     // Transaction successful, save order
//     let resolvedGiftID: number;
//     try {
//       resolvedGiftID = resolveGiftID();
//     } catch (e: any) {
//       console.error("Gift ID resolution failed:", e);
//       setError(e?.message || "Gift ID resolution failed");
//       setLoading(false);
//       return;
//     }

//     const orderPayload: OrderPayload = {
//       trackingID: signature,
//       customerID: getCustomerIDFromStorage(),
//       merchantID: item.merchantID ?? null,
//       giftID: resolvedGiftID,
//       paymentMethod: "crypto(solana)",
//       amount: computedAmount,
//       networkFee: networkFee,
//       recipientName,
//       recipientStreet,
//       recipientCity,
//       recipientState,
//       recipientCountry,
//       giftMessage,
//       quantity,
//       gift: item.name,
//       status: "pending",
//       recipientPhone: recipientPhone,
//       senderWallet: publicKey?.toBase58() ?? null,
//     };

//     await saveOrderToBackend(orderPayload);

//     setShowPaymentChoice(false);
//     setShowCardModal(false);
//     alert("Crypto payment successful. Gift is being processed.");
//     handleClose();
//   } catch (err: any) {
//     console.error("Unexpected error in crypto payment:", err);
//     setError(err?.message || "Unexpected error");
//   } finally {
//     setLoading(false);
//   }
// };

//   // Add this function at the top of your component or in a utils file
// const convertUsdToNgn = async (usdAmount: number): Promise<number> => {
//   try {
//     // You can use a free API like exchangerate-api.com or fixer.io
//     // For development, you can use a fixed rate or fetch live rates
    
//     // Option 1: Use a fixed exchange rate (quick solution)
//     const FIXED_USD_TO_NGN_RATE = 1650; // Update this periodically
//     return usdAmount * FIXED_USD_TO_NGN_RATE;
    
//   } catch (error) {
//     console.warn('Failed to get exchange rate, using fallback:', error);
//     // Fallback rate if API fails
//     const FALLBACK_USD_TO_NGN_RATE = 1650;
//     return usdAmount * FALLBACK_USD_TO_NGN_RATE;
//   }
// };

// const handleCardPayment = async () => {
//   setError(null);

//   // 1) Validate recipient + order inputs
//   const validationErr = validateOrderInputs();
//   if (validationErr) {
//     setError(validationErr);
//     return;
//   }

//   // 2) Resolve giftID early
//   let resolvedGiftID: number;
//   try {
//     resolvedGiftID = resolveGiftID();
//   } catch (e: any) {
//     console.error("[paystack] resolveGiftID error:", e);
//     setError(e?.message || "Gift ID resolution failed");
//     return;
//   }

//   // 3) Ensure we have a customer email (Paystack requires email)
//   const customerEmail = getCustomerEmailFromStorage();
//   if (!customerEmail) {
//     setError("Please ensure your account has a valid email address before paying with card.");
//     return;
//   }

//   setLoading(true);
//   try {
//     // 4) build API base safely (strip trailing slash)
//     const VITE_API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
//     const apiBase = VITE_API_URL.replace(/\/$/, ""); // removes trailing slash if present

//     // 5) Convert USD to NGN for Paystack
//     console.debug("[paystack:convert] Converting USD to NGN", { originalAmount: totalPayable });
//     const ngnAmount = await convertUsdToNgn(totalPayable);
//     console.debug("[paystack:convert] Converted amount", { usd: totalPayable, ngn: ngnAmount });

//     // 6) Use NGN as currency for Paystack
//     const currency = "NGN";

//     // 7) initialize body for backend (backend will convert to subunits)
//     const initBody = {
//       amount: ngnAmount, // Use converted NGN amount
//       currency,
//       email: "itiza.co@gmail.com",
//       fullName: cardName || undefined,
//       metadata: {
//         giftID: resolvedGiftID,
//         merchantID: item.merchantID ?? null,
//         recipientName,
//         originalAmount: totalPayable, // Store original USD amount for reference
//         originalCurrency: "USD",
//         exchangeRate: ngnAmount / totalPayable, // Store the exchange rate used
//       },
//     };

//     console.debug("[paystack:init] POST ->", `${apiBase}/Itiza_Delivery/payments/paystack/initialize`, { initBody });

//     // 8) call backend initialize endpoint
//     const initResp = await fetch(`https://itiza-backend.vercel.app/api/paystack/initialize`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(initBody),
//     });

//     // parse JSON robustly
//     let initJson: any = null;
//     try {
//       initJson = await initResp.json();
//     } catch (parseErr) {
//       console.error("[paystack:init] failed to parse JSON:", parseErr);
//       initJson = null;
//     }

//     console.debug("[paystack:init] response status:", initResp.status, "body:", initJson);

//     // 9) handle errors from initialize
//     if (!initResp.ok || !initJson || !initJson.success || !initJson.data) {
//       console.error("[paystack:init] initialize failed", initResp.status, initJson);
//       // If server returned structured error, surface it
//       const msg = initJson?.error || initJson?.message || `Failed to initialize Paystack payment (status ${initResp.status})`;
//       throw new Error(msg);
//     }

//     // 10) pick authorization_url and reference (supports mocked response from server too)
//     const { authorization_url: authorizationUrl, reference } = initJson.data;
//     if (!authorizationUrl || !reference) {
//       console.error("[paystack:init] missing authorization_url/reference", initJson.data);
//       throw new Error("Paystack initialization did not return authorization_url/reference");
//     }

//     console.debug("[paystack:init] got authorizationUrl/reference", { authorizationUrl, reference });

//     // 11) Show user the NGN amount before redirect (optional)
//     const shouldContinue = confirm(
//       `You will be charged ₦${ngnAmount.toLocaleString()} NGN (approximately $${totalPayable.toFixed(2)} USD). Continue?`
//     );
//     if (!shouldContinue) {
//       setLoading(false);
//       return;
//     }

//     // 12) open Paystack checkout (popup or redirect)
//     const popup = window.open(authorizationUrl, "_blank", "noopener,noreferrer");
//     if (!popup) {
//       console.warn("[paystack] popup blocked - falling back to full redirect");
//       window.location.href = authorizationUrl;
//     }

//     // 13) Poll verify endpoint until success/failure or timeout
//     const verifyUrlBase = `https://itiza-backend.vercel.app/api/paystack/verify`;
//     const pollIntervalMs = 3000;
//     const maxPollAttempts = 40; // ~2 minutes
//     let attempts = 0;
//     let verified = false;
//     let lastVerifyResult: any = null;

//     console.debug("[paystack:verify] starting poll", { verifyUrlBase, reference, maxPollAttempts, pollIntervalMs });

//     while (attempts < maxPollAttempts && !verified) {
//       attempts += 1;
//       // wait
//       await new Promise((r) => setTimeout(r, pollIntervalMs));

//       try {
//         const vResp = await fetch(`${verifyUrlBase}?reference=${encodeURIComponent(reference)}`, {
//           credentials: "include", // ADD THIS
//         });
        
//         let vJson: any = null;
//         try {
//           vJson = await vResp.json();
//         } catch (e) {
//           console.warn("[paystack:verify] parse error:", e);
//           vJson = null;
//         }

//         lastVerifyResult = { status: vResp.status, body: vJson };
//         console.debug(`[paystack:verify] attempt ${attempts}`, lastVerifyResult);

//         if (vResp.ok && vJson?.success && vJson.data) {
//           const status = String(vJson.data.status ?? "").toLowerCase();
//           console.debug("[paystack:verify] transaction status:", status);
//           if (status === "success") {
//             verified = true;
//             break;
//           } else if (["failed", "abandoned", "error"].includes(status)) {
//             // stop polling on terminal non-success
//             break;
//           }
//         } else {
//           // non-OK responses are logged; continue polling until attempts exhausted
//           console.debug("[paystack:verify] not verified yet", vResp.status, vJson);
//         }
//       } catch (err) {
//         console.warn("[paystack:verify] polling error:", err);
//       }
//     }

//     // 14) handle not-verified
//     if (!verified) {
//       const msg =
//         lastVerifyResult?.body?.error ||
//         lastVerifyResult?.body?.message ||
//         `Payment was not completed or timed out after ${Math.round((pollIntervalMs * maxPollAttempts) / 1000)}s.`;
//       console.warn("[paystack:verify] not verified:", lastVerifyResult, msg);
//       setLoading(false);
//       setError(msg);
//       return;
//     }

//     // 15) Verified success -> store order
//     console.debug("[paystack] payment verified, saving order with reference:", reference);

//     const orderPayload: OrderPayload = {
//       trackingID: reference,
//       customerID: getCustomerIDFromStorage(),
//       merchantID: item.merchantID ?? null,
//       giftID: resolvedGiftID,
//       paymentMethod: "paystack_card",
//       amount: computedAmount, // Keep original USD amount in the order
//       networkFee,
//       recipientName,
//       recipientStreet,
//       recipientCity,
//       recipientState,
//       recipientCountry,
//       giftMessage,
//       quantity,
//       gift: item.name,
//       status: "pending",
//       recipientPhone: recipientPhone,
//       senderWallet: null,
//     };

//     console.debug("[orders] saving payload:", orderPayload);
//     await saveOrderToBackend(orderPayload);

//     // 16) success UX
//     setShowCardModal(false);
//     setShowPaymentChoice(false);
//     alert("Card payment successful — order saved.");
//     handleClose();
//   } catch (err: any) {
//     console.error("[paystack] card flow error:", err);
//     setError(err?.message || "Card payment failed");
//   } finally {
//     setLoading(false);
//   }
// };








//   // sanitize phone input while typing
//   const onRecipientPhoneChange = (value: string) => {
//     const digits = value.replace(/\D/g, "");
//     setRecipientPhone(digits);
//   };

//   //
//   // IMPORTANT: if modal isn't open, short-circuit rendering so it unmounts cleanly.
//   //
//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="fixed inset-0 z-50 flex items-center justify-center">
//         <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
//         <div className="relative bg-white/90 backdrop-blur-md w-full max-w-3xl m-4 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
//           <button onClick={handleClose} className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c]">
//             <X size={24} />
//           </button>

//           <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[90vh] overflow-y-auto">
//             <div className="aspect-square rounded-xl overflow-hidden">
//               <img src={item.img ?? ""} alt={item.name} className="w-full h-full object-cover" />
//             </div>

//             <div className="space-y-4">
//               <h3 className="font-serif text-2xl text-[#832c2c] mb-1">{item.name}</h3>
//               <p className="text-[#832c2c]/70">Unit price: ${unitPrice.toFixed(2)}</p>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                   <p className="text-red-700 text-sm">{error}</p>
//                 </div>
//               )}

//               <div className="flex flex-wrap gap-2">
//                 {relationships.map((rel) => (
//                   <button
//                     key={rel}
//                     onClick={() => setSelectedRelation(rel)}
//                     className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
//                       selectedRelation === rel ? "bg-[#e47a7a] text-white" : "bg-[#fce8e6] text-[#832c2c] hover:bg-[#f6c1c1]"
//                     }`}
//                   >
//                     {rel}
//                   </button>
//                 ))}
//               </div>

//               <textarea
//                 value={giftMessage}
//                 onChange={(e) => setGiftMessage(e.target.value)}
//                 placeholder="Write a message to the recipient..."
//                 className="w-full h-20 p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] resize-none"
//               />

//               <div className="space-y-2">
//                 <Label>Recipient name</Label>
//                 <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />

//                 <Label>Recipient phone</Label>
//                 <input
//                   className="w-full p-3 rounded-xl border border-[#f6c1c1]"
//                   value={recipientPhone}
//                   onChange={(e) => onRecipientPhoneChange(e.target.value)}
//                   placeholder="Digits only, e.g. 2348012345678"
//                   inputMode="tel"
//                 />

//                 <Label>Street</Label>
//                 <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientStreet} onChange={(e) => setRecipientStreet(e.target.value)} />

//                 <div className="grid grid-cols-2 gap-2">
//                   <div>
//                     <Label>City</Label>
//                     <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} />
//                   </div>
//                   <div>
//                     <Label>State</Label>
//                     <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientState} onChange={(e) => setRecipientState(e.target.value)} />
//                   </div>
//                 </div>

//                 <Label>Country</Label>
//                 <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientCountry} onChange={(e) => setRecipientCountry(e.target.value)} />
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="w-24">
//                   <Label>Quantity</Label>
//                   <input
//                     type="number"
//                     min={1}
//                     value={quantity}
//                     onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
//                     className="w-full p-3 rounded-xl border border-[#f6c1c1]"
//                   />
//                 </div>

//                 <div className="flex-1">
//                   <Label>Order totals</Label>
//                   <div className="p-3 rounded-xl border border-[#f6c1c1] bg-white/50">
//                     <div className="flex justify-between text-sm"><span>Subtotal</span><span>${computedAmount.toFixed(2)}</span></div>
//                     <div className="flex justify-between text-sm"><span>Network fee (2.5%)</span><span>${networkFee.toFixed(2)}</span></div>
//                     <div className="flex justify-between font-medium mt-2"><span>Total</span><span>${totalPayable.toFixed(2)}</span></div>
//                     <div className="text-xs text-gray-500 mt-1">~{totalPayableSol.toFixed(3)} SOL</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2 mt-2">
//                 <Label>Payment token</Label>
//                 <select disabled className="w-full p-3 rounded-xl border border-[#f6c1c1]">
//                   <option>Solana (SOL)</option>
//                 </select>
//               </div>

//               <div className="flex gap-3 mt-2">
//                 <Button onClick={handleClose} className="flex-1 bg-[#fce8e6] text-[#832c2c]">Cancel</Button>

//                 <Button
//                   onClick={onAttemptOpenPaymentChoices}
//                   className="flex-1 bg-[#e47a7a] text-white"
//                   disabled={!isRecipientFormValid || loading}
//                 >
//                   {loading ? "Processing..." : "Pay / Send Gift"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Payment Choice */}
//       {showPaymentChoice && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setShowPaymentChoice(false)} />
//           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
//             <button onClick={() => setShowPaymentChoice(false)} className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c]">
//               <X size={20} />
//             </button>

//             <h4 className="text-xl font-semibold text-[#832c2c] mb-2">Choose payment method</h4>
//             <p className="text-sm text-gray-600 mb-4">Select how you'd like to pay for this gift.</p>

//             <div className="space-y-3">
//               <button
//                 onClick={async () => {
//                   setShowPaymentChoice(false);
//                   await handleCryptoPayment();
//                 }}
//                 className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:opacity-95"
//               >
//                 <div>
//                   <div className="text-sm font-medium">Pay with crypto</div>
//                   <div className="text-xs opacity-80">Pay using your connected Solana wallet (SOL)</div>
//                 </div>
//                 <div className="ml-4 text-xs opacity-90">{`${totalPayableSol.toFixed(3)} SOL`}</div>
//               </button>

//               <button
//                 onClick={() => setShowCardModal(true)}
//                 className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#f6c1c1] bg-white text-[#832c2c] font-medium hover:bg-[#fff2f2]"
//               >
//                 <div>
//                   <div className="text-sm font-medium">Pay with card</div>
//                   <div className="text-xs opacity-80">Paystack (secure)</div>
//                 </div>
//                 <div className="ml-4 text-xs opacity-90">${totalPayable.toFixed(2)}</div>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Card Modal (only used to show card UX; actual card entry happens on Paystack page) */}
//       {showCardModal && (
//         <div className="fixed inset-0 z-[70] flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setShowCardModal(false)} />
//           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
//             <button onClick={() => setShowCardModal(false)} className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c]">
//               <X size={20} />
//             </button>

//             <h4 className="text-lg font-semibold text-[#832c2c] mb-2">Pay with card</h4>
//             <p className="text-sm text-gray-600 mb-4">You'll be redirected to Paystack to complete your card payment.</p>

//             <div className="space-y-3">
//               {/* Keep card inputs visually, but card data is entered on Paystack hosted page */}
//               <input placeholder="Card number (optional - Paystack checkout is used)" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full p-3 rounded-lg border border-[#f6c1c1]" inputMode="numeric" />
//               <input placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full p-3 rounded-lg border border-[#f6c1c1]" />
//               <div className="flex gap-2">
//                 <input placeholder="MM/YY or MM/YYYY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="flex-1 p-3 rounded-lg border border-[#f6c1c1]" />
//                 <input placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="w-24 p-3 rounded-lg border border-[#f6c1c1]" inputMode="numeric" />
//               </div>
//             </div>

//             <div className="mt-6 flex gap-3">
//               <Button onClick={() => setShowCardModal(false)} className="flex-1 bg-[#fce8e6] text-[#832c2c]">Cancel</Button>
//               <Button onClick={handleCardPayment} className="flex-1 bg-[#e47a7a] text-white" disabled={loading}>
//                 {loading ? "Processing..." : `Pay ${totalPayable.toFixed(2)}`}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Login modal shown from GiftModal: disable user-close while shown from here and hide secondary actions */}
//       {showLoginModal && (
//         <LoginModal
//           isOpen={showLoginModal}
//           onClose={() => setShowLoginModal(false)}
//           onSwitchToSignup={() => setShowLoginModal(false)}
//           onSwitchToResetPasswordModal={() => setShowLoginModal(false)}
//           setIsLoggedIn={(v) => setIsLoggedIn(v)}
//           setUserFullName={() => {}}
//           disableClose={true}
//           hideSecondaryActions={true}
//         />
//       )}
//     </>
//   );
// }




































































































// src/components/GiftModal.tsx
import _React, { useEffect, useMemo, useState } from "react";
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
import { fetchCurrentUser } from "./fetchCurrentUser";
import LoginModal from "../pages/Login";

//
// Types
//
export interface GiftItem {
  giftID?: number | string | null;
  merchantID?: string | null;
  name: string;
  price?: number | null;
  stockQuantity?: string | number | null;
  description?: string | null;
  img?: string | null; // url or data uri
  created_at?: string | null;
}

export interface GiftModalProps {
  item: GiftItem;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderPayload {
  trackingID?: string | null;
  customerID?: string | null;
  merchantID?: string | null;
  giftID?: number | null;
  paymentMethod?: string | null;
  amount?: number | null;
  networkFee?: number | null;
  recipientName?: string | null;
  recipientStreet?: string | null;
  recipientCity?: string | null;
  recipientState?: string | null;
  recipientCountry?: string | null;
  giftMessage?: string | null;
  quantity?: number | null;
  gift?: string | null;
  status?: string | null;
  recipientPhone?: string | null;
  senderWallet?: string | null;
}

//
// Helpers & constants
//
const relationships = [
  "Wife",
  "Husband",
  "Son",
  "Daughter",
  "Friend",
  "Mother",
  "Father",
  "Partner",
  "Mentor",
];

// local USD->SOL for display only (consider fetching live in future)
const USD_TO_SOL_RATE = 0.08;
function convertUsdToSol(usdAmount: number): number {
  return usdAmount * USD_TO_SOL_RATE;
}

const TEST_WALLET_PUBLIC_KEY = new PublicKey(
  "98TcoasyWn7tsfo5JVpjXCy43eNfREBRerF8gUpJipSS"
);

const estimatedFeePercent = 0.025; // 2.5%

const RPC_ENDPOINTS: string[] = [
  import.meta.env.VITE_SOLANA_RPC_URL ?? "",
  import.meta.env.VITE_SOLANA_FALLBACK_RPC_URL ?? "",
].filter(Boolean);

export default function GiftModal({ item, isOpen, onClose }: GiftModalProps) {
  const { publicKey, connected, signTransaction } = useWallet();

  // Persisted customer info (from /auth/me or localStorage)
  const [customerID, setCustomerID] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [_customerPhone, setCustomerPhone] = useState<string | null>(null);

  // recipient & order fields
  const [selectedRelation, setSelectedRelation] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientStreet, setRecipientStreet] = useState("");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientState, setRecipientState] = useState("");
  const [recipientCountry, setRecipientCountry] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [quantity, setQuantity] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // payment UI
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  // Login modal (auth) handling
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pendingPaymentAfterLogin, setPendingPaymentAfterLogin] = useState(false);

  // Card form inputs (kept for UI; actual card processing uses Paystack hosted checkout)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Reset helper
  const resetForm = () => {
    setSelectedRelation("");
    setRecipientName("");
    setRecipientPhone("");
    setRecipientStreet("");
    setRecipientCity("");
    setRecipientState("");
    setRecipientCountry("");
    setGiftMessage("");
    setQuantity(1);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setError(null);
    setLoading(false);
    setShowPaymentChoice(false);
    setShowCardModal(false);
    setPendingPaymentAfterLogin(false);
    // Do not clear customer fields here so they persist
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // when modal closes, reset form
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch current user when modal opens (prefill customer info). If no user, open login modal.
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (!mounted) return;
        if (user) {
          const id = (user.customerID || user.email || user.identifier || null) as string | null;
          if (id) {
            setCustomerID(id);
            try {
              localStorage.setItem("userCustomerID", id);
            } catch {}
          }
          const email = (user.email as string | undefined) ?? null;
          if (email) {
            setCustomerEmail(email);
            try {
              localStorage.setItem("userEmail", email);
            } catch {}
          } else if (!email && id && id.includes("@")) {
            setCustomerEmail(id);
            try {
              localStorage.setItem("userEmail", id);
            } catch {}
          }

          const phone =
            (user.phoneNumber as string | undefined) ??
            (user.phone as string | undefined) ??
            (user.phonenumber as string | undefined) ??
            null;

          if (phone) {
            setCustomerPhone(phone);
            try {
              localStorage.setItem("userPhone", phone);
            } catch {}
          }

          setIsLoggedIn(true);
        } else {
          // not authenticated — require login
          setIsLoggedIn(false);
          setShowLoginModal(true);
        }
      } catch (err) {
        console.warn("fetchCurrentUser failed:", err);
        setIsLoggedIn(false);
        setShowLoginModal(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Computed amounts
  const unitPrice = Number(item.price ?? 0);
  const computedAmount = Number((unitPrice * (quantity || 0)).toFixed(2));
  const networkFee = Number((computedAmount * estimatedFeePercent).toFixed(2));
  const totalPayable = Number((computedAmount + networkFee).toFixed(2));
  const totalPayableSol = convertUsdToSol(totalPayable);

  const getCustomerIDFromStorage = (): string | null =>
    customerID ||
    ((() => {
      try {
        return (
          localStorage.getItem("userIdentifier") ||
          localStorage.getItem("userCustomerID") ||
          localStorage.getItem("userEmail") ||
          null
        );
      } catch {
        return null;
      }
    })());

  const getCustomerEmailFromStorage = (): string | null =>
    customerEmail || getCustomerIDFromStorage();

  //
  // Recipient validation
  //
  const recipientValidationError = (): string | null => {
    const trim = (s: string) => (s ?? "").trim();
    if (!trim(recipientName)) return "Recipient name is required";
    if (!trim(recipientPhone)) return "Recipient phone is required";
    if (!/^\d{7,15}$/.test(recipientPhone)) return "Recipient phone must be digits only (7-15 digits)";
    if (!trim(recipientStreet)) return "Recipient street is required";
    if (!trim(recipientCity)) return "Recipient city is required";
    if (!trim(recipientState)) return "Recipient state is required";
    if (!trim(recipientCountry)) return "Recipient country is required";
    if (!selectedRelation) return "Please select your relationship to the recipient";
    if (!quantity || quantity <= 0) return "Quantity must be at least 1";
    if (unitPrice <= 0) return "Invalid gift price";
    return null;
  };

  const isRecipientFormValid = useMemo(() => recipientValidationError() === null, [
    recipientName,
    recipientPhone,
    recipientStreet,
    recipientCity,
    recipientState,
    recipientCountry,
    selectedRelation,
    quantity,
    item.price,
  ]);

  // Handler to attempt to open payment choices — ensures validation + auth
  const onAttemptOpenPaymentChoices = async () => {
    setError(null);

    const valErr = recipientValidationError();
    if (valErr) {
      setError(valErr);
      return;
    }

    if (!isLoggedIn) {
      try {
        const user = await fetchCurrentUser();
        if (user) {
          const id = (user.customerID || user.email || user.identifier || null) as string | null;
          if (id) {
            setCustomerID(id);
            try {
              localStorage.setItem("userCustomerID", id);
            } catch {}
          }
          const email = (user.email as string | undefined) ?? null;
          if (email) {
            setCustomerEmail(email);
            try {
              localStorage.setItem("userEmail", email);
            } catch {}
          }
          const phone =
            (user.phoneNumber as string | undefined) ??
            (user.phone as string | undefined) ??
            (user.phonenumber as string | undefined) ??
            null;
          if (phone) {
            setCustomerPhone(phone);
            try {
              localStorage.setItem("userPhone", phone);
            } catch {}
          }
          setIsLoggedIn(true);
          setShowPaymentChoice(true);
          return;
        }
      } catch (err) {
        console.warn("fetchCurrentUser failed on payment attempt:", err);
      }

      // Not authenticated — show login modal and continue after success
      setPendingPaymentAfterLogin(true);
      setShowLoginModal(true);
      return;
    }

    setShowPaymentChoice(true);
  };

  // After login modal closes (or user logged in) — re-check auth and continue pending flow if any
  useEffect(() => {
    if (!showLoginModal) {
      (async () => {
        if (!isLoggedIn) {
          const user = await fetchCurrentUser();
          if (user) {
            const id = (user.customerID || user.email || user.identifier || null) as string | null;
            if (id) {
              setCustomerID(id);
              try {
                localStorage.setItem("userCustomerID", id);
              } catch {}
            }
            const email = (user.email as string | undefined) ?? null;
            if (email) {
              setCustomerEmail(email);
              try {
                localStorage.setItem("userEmail", email);
              } catch {}
            }
            const phone =
              (user.phoneNumber as string | undefined) ??
              (user.phone as string | undefined) ??
              (user.phonenumber as string | undefined) ??
              null;
            if (phone) {
              setCustomerPhone(phone);
              try {
                localStorage.setItem("userPhone", phone);
              } catch {}
            }
            setIsLoggedIn(true);

            if (pendingPaymentAfterLogin) {
              setPendingPaymentAfterLogin(false);
              setShowPaymentChoice(true);
            }
          }
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoginModal]);

  //
  // Orders + payments (saveOrderToBackend, resolveGiftID, handlers)
  //
  const saveOrderToBackend = async (payload: OrderPayload) => {
    try {
      console.log("[orders] saving payload:", payload);

      const VITE_API_URL = (import.meta.env.VITE_API_URL as string) || "https://itiza-backend.vercel.app";
      const resp = await fetch(`${VITE_API_URL.replace(/\/$/, "")}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        let bodyText = "";
        let bodyJson: any = null;
        try {
          bodyJson = await resp.json();
        } catch (_) {
          bodyText = await resp.text();
        }
        console.error("Order save failed:", resp.status, bodyJson ?? bodyText);
        throw new Error(
          `Database insert failed (status ${resp.status}) - ${JSON.stringify(bodyJson ?? bodyText)}`
        );
      }

      const body = await resp.json().catch(() => ({}));
      console.log("Order save response:", body);
      return body;
    } catch (err: any) {
      console.error("Error saving order:", err);
      throw err;
    }
  };

  const resolveGiftID = (): number => {
    const raw = item.giftID;
    if (raw === undefined || raw === null) {
      throw new Error("giftID is missing on the item. Ensure the selected gift has a numeric giftID.");
    }
    if (typeof raw === "number") {
      if (!Number.isFinite(raw)) throw new Error("giftID is not a finite number");
      return Math.floor(raw);
    }
    const parsed = Number(String(raw).trim());
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      throw new Error(`giftID is not numeric: ${String(raw)}`);
    }
    return Math.floor(parsed);
  };

  const validateOrderInputs = (): string | null => recipientValidationError();

  // Crypto payment handler (unchanged behaviour but small robustness improvements)
  const handleCryptoPayment = async () => {
    setError(null);
    const validationErr = validateOrderInputs();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    if (!connected || !publicKey || !signTransaction) {
      setError("Please connect your wallet to pay with crypto.");
      return;
    }

    if (loading) {
      console.log("Payment already in progress, ignoring duplicate request");
      return;
    }

    let connection: Connection | null = null;
    for (const url of RPC_ENDPOINTS) {
      try {
        const conn = new Connection(url, "confirmed");
        await conn.getVersion();
        connection = conn;
        break;
      } catch (e) {
        console.warn("RPC failed, trying next", url);
      }
    }
    if (!connection) {
      setError("No RPC endpoints available. Try again later.");
      return;
    }

    const totalLamports = Math.round(totalPayableSol * LAMPORTS_PER_SOL);

    try {
      setLoading(true);

      const bal = await connection.getBalance(publicKey);
      if (bal < totalLamports) {
        setError(
          `Insufficient SOL. Need ${totalPayableSol.toFixed(6)} SOL, have ${(bal / LAMPORTS_PER_SOL).toFixed(6)} SOL`
        );
        setLoading(false);
        return;
      }

      // IMPORTANT: Get fresh blockhash right before creating transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

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

      // Sign the transaction
      let signedTx: Transaction;
      try {
        signedTx = await signTransaction(tx);
      } catch (err) {
        console.error("signTransaction error", err);
        setError("Transaction signing failed or was rejected");
        setLoading(false);
        return;
      }

      // Send transaction with skipPreflight: true to avoid simulation issues (you can change if you want)
      let signature: string;
      try {
        signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: true,
          maxRetries: 3,
        });
        console.log("Sent tx signature:", signature);
      } catch (err: any) {
        console.error("sendRawTransaction error", err);

        // Check if it's a duplicate transaction error
        if (err?.message?.includes("already been processed")) {
          setError("This transaction was already sent. Please wait for confirmation.");
        } else {
          setError("Network error sending transaction");
        }
        setLoading(false);
        return;
      }

      // Confirm transaction
      try {
        const conf = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed"
        );

        if (conf.value?.err) {
          console.error("confirmTransaction err:", conf.value.err);
          setError("Transaction confirmation failed");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("confirmTransaction thrown:", err);
        setError("Transaction confirmation failed");
        setLoading(false);
        return;
      }

      // Transaction successful, save order
      let resolvedGiftID: number;
      try {
        resolvedGiftID = resolveGiftID();
      } catch (e: any) {
        console.error("Gift ID resolution failed:", e);
        setError(e?.message || "Gift ID resolution failed");
        setLoading(false);
        return;
      }

      const orderPayload: OrderPayload = {
        trackingID: signature,
        customerID: getCustomerIDFromStorage(),
        merchantID: item.merchantID ?? null,
        giftID: resolvedGiftID,
        paymentMethod: "crypto(solana)",
        amount: computedAmount,
        networkFee: networkFee,
        recipientName,
        recipientStreet,
        recipientCity,
        recipientState,
        recipientCountry,
        giftMessage,
        quantity,
        gift: item.name,
        status: "pending",
        recipientPhone: recipientPhone,
        senderWallet: publicKey?.toBase58() ?? null,
      };

      await saveOrderToBackend(orderPayload);

      setShowPaymentChoice(false);
      setShowCardModal(false);
      alert("Crypto payment successful. Gift is being processed.");
      handleClose();
    } catch (err: any) {
      console.error("Unexpected error in crypto payment:", err);
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  //
  // Currency conversion helper (USD -> NGN) (frontend fallback)
  //
  const convertUsdToNgn = async (usdAmount: number): Promise<number> => {
    // If you want live rates, set VITE_EXCHANGE_RATE_API in env and fetch here.
    // For now we use a fallback fixed rate but keep function async for future extension.
    try {
      const FIXED_USD_TO_NGN_RATE = Number(import.meta.env.VITE_USD_TO_NGN_RATE) || 1650;
      return Math.round(usdAmount * FIXED_USD_TO_NGN_RATE);
    } catch (error) {
      console.warn("Failed to get exchange rate, using fallback:", error);
      const FALLBACK_USD_TO_NGN_RATE = 1650;
      return Math.round(usdAmount * FALLBACK_USD_TO_NGN_RATE);
    }
  };

  // Card payment with synchronous popup + polling + fallback redirect/callback
  const handleCardPayment = async () => {
    setError(null);

    // 1) Validate recipient + order inputs
    const validationErr = validateOrderInputs();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    // 2) Resolve giftID early
    let resolvedGiftID: number;
    try {
      resolvedGiftID = resolveGiftID();
    } catch (e: any) {
      console.error("[paystack] resolveGiftID error:", e);
      setError(e?.message || "Gift ID resolution failed");
      return;
    }

    // 3) Ensure we have a customer email (Paystack requires email)
    const email = getCustomerEmailFromStorage();
    if (!email) {
      setError("Please ensure your account has a valid email address before paying with card.");
      return;
    }

    if (loading) return;
    setLoading(true);

    // Build API base
    const VITE_API_URL = (import.meta.env.VITE_API_URL as string) || "https://itiza-backend.vercel.app";
    const apiBase = VITE_API_URL.replace(/\/$/, "");

    // --- Persist a draft order to localStorage BEFORE initialize (fallback for redirect callback)
    const draftForCallback: Partial<OrderPayload> = {
      trackingID: null,
      customerID: getCustomerIDFromStorage(),
      merchantID: item.merchantID ?? null,
      giftID: resolvedGiftID,
      paymentMethod: "paystack_card",
      amount: computedAmount,
      networkFee,
      recipientName,
      recipientStreet,
      recipientCity,
      recipientState,
      recipientCountry,
      giftMessage,
      quantity,
      gift: item.name,
      status: "pending",
      recipientPhone: recipientPhone,
      senderWallet: null,
    };
    try {
      localStorage.setItem("itiza_paystack_order_draft", JSON.stringify(draftForCallback));
    } catch (e) {
      console.warn("Failed to persist paystack draft:", e);
    }

    // Open popup synchronously to avoid blockers
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (popup) {
      try {
        popup.document.title = "Opening Paystack…";
        popup.document.body.innerHTML = "<p style='font-family:system-ui,Arial; padding:20px'>Opening checkout... If this page stays blank, please allow popups for this site.</p>";
      } catch {
        // ignore cross-origin write failures
      }
    } else {
      console.warn("[paystack] popup blocked at open(); will fall back to redirect if needed.");
    }

    try {
      // Convert USD to NGN
      console.debug("[paystack:convert] Converting USD to NGN", { originalAmount: totalPayable });
      const ngnAmount = await convertUsdToNgn(totalPayable);
      console.debug("[paystack:convert] Converted amount", { usd: totalPayable, ngn: ngnAmount });

      const currency = "NGN";

      // initialize body for backend (backend will convert to subunits)
      const initBody = {
        amount: ngnAmount, // integer NGN amount (backend will multiply by 100 for kobo)
        currency,
        email,
        fullName: cardName || undefined,
        metadata: {
          customerID: getCustomerIDFromStorage(),
          giftID: resolvedGiftID,
          merchantID: item.merchantID ?? null,
          recipientName,
          recipientPhone,
          recipientStreet,
          recipientCity,
          recipientState,
          recipientCountry,
          quantity,
          originalAmount: totalPayable,
          networkFee,
          originalCurrency: "USD",
          gift: item.name,
        },
      };

      console.debug("[paystack:init] POST ->", `${apiBase}/api/paystack/initialize`, { initBody });

      // call backend initialize endpoint
      const initResp = await fetch(`${apiBase}/api/paystack/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(initBody),
      });

      // parse JSON robustly
      let initJson: any = null;
      try {
        initJson = await initResp.json();
      } catch (parseErr) {
        console.error("[paystack:init] failed to parse JSON:", parseErr);
        initJson = null;
      }

      console.debug("[paystack:init] response status:", initResp.status, "body:", initJson);

      // handle errors from initialize
      if (!initResp.ok || !initJson || !initJson.success || !initJson.data) {
        console.error("[paystack:init] initialize failed", initResp.status, initJson);
        // close popup and show a message if possible
        if (popup && !popup.closed) {
          try {
            popup.document.body.innerHTML = "<p style='padding:20px'>Failed to open checkout. Please try again.</p>";
            setTimeout(() => popup.close(), 2500);
          } catch {}
        }
        const msg = initJson?.error || initJson?.message || `Failed to initialize Paystack payment (status ${initResp.status})`;
        throw new Error(msg);
      }

      // pick authorization_url and reference (supports mocked response from server too)
      const { authorization_url: authorizationUrl, reference } = initJson.data;
      if (!authorizationUrl || !reference) {
        if (popup && !popup.closed) { try { popup.close(); } catch {} }
        throw new Error("Paystack initialization did not return authorization_url/reference");
      }

      // update stored draft with reference so callback can find it
      try {
        const raw = localStorage.getItem("itiza_paystack_order_draft");
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.trackingID = reference;
          localStorage.setItem("itiza_paystack_order_draft", JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn("Failed to update paystack draft with reference:", e);
      }

      // navigate popup (preferred) or full redirect if blocked
      if (popup && !popup.closed) {
        try {
          popup.location.href = authorizationUrl;
          popup.focus();
        } catch (e) {
          // fallback to full redirect
          window.location.href = authorizationUrl;
        }
      } else {
        // popup blocked — fall back to full redirect (this WILL stop polling)
        window.location.href = authorizationUrl;
      }

      // start polling in the main page. This will keep running while popup is open.
      const verifyUrlBase = `${apiBase}/api/paystack/verify`;
      const pollIntervalMs = 3000;
      const maxPollAttempts = 40; // ~2 minutes
      let attempts = 0;
      let verified = false;
      let lastVerifyResult: any = null;

      console.debug("[paystack:verify] starting poll", { verifyUrlBase, reference, maxPollAttempts, pollIntervalMs });

      while (attempts < maxPollAttempts && !verified) {
        attempts += 1;

        // if popup exists and user closed it, abort polling
        if (popup && popup.closed) {
          console.warn("[paystack:verify] popup closed by user, aborting poll");
          break;
        }

        await new Promise((r) => setTimeout(r, pollIntervalMs));

        try {
          const vResp = await fetch(`${verifyUrlBase}?reference=${encodeURIComponent(reference)}`, {
            credentials: "include",
          });

          let vJson: any = null;
          try {
            vJson = await vResp.json();
          } catch (e) {
            console.warn("[paystack:verify] parse error:", e);
            vJson = null;
          }

          lastVerifyResult = { status: vResp.status, body: vJson };
          console.debug(`[paystack:verify] attempt ${attempts}`, lastVerifyResult);

          if (vResp.ok && vJson?.success && vJson.data) {
            const status = String(vJson.data.status ?? "").toLowerCase();
            console.debug("[paystack:verify] transaction status:", status);
            if (status === "success") {
              verified = true;
              break;
            } else if (["failed", "abandoned", "error"].includes(status)) {
              // stop polling on terminal non-success
              break;
            }
          } else {
            // non-OK responses are logged; continue polling until attempts exhausted
            console.debug("[paystack:verify] not verified yet", vResp.status, vJson);
          }
        } catch (err) {
          console.warn("[paystack:verify] polling error:", err);
        }
      }

      // cleanup popup if still open
      try {
        if (popup && !popup.closed) {
          if (verified) {
            try { popup.close(); } catch {}
          }
        }
      } catch {}

      // handle not-verified
      if (!verified) {
        const msg =
          lastVerifyResult?.body?.error ||
          lastVerifyResult?.body?.message ||
          (popup && popup.closed ? "Payment popup closed before completing payment." : `Payment was not completed or timed out after ${Math.round((pollIntervalMs * maxPollAttempts) / 1000)}s.`);
        console.warn("[paystack:verify] not verified:", lastVerifyResult, msg);
        setError(msg);
        setLoading(false);
        return;
      }

      // Verified success -> store order (best-effort; webhook is the reliable source-of-truth)
      console.debug("[paystack] payment verified, saving order with reference:", reference);

      const orderPayload: OrderPayload = {
        trackingID: reference,
        customerID: getCustomerIDFromStorage(),
        merchantID: item.merchantID ?? null,
        giftID: resolvedGiftID,
        paymentMethod: "paystack_card",
        amount: computedAmount, // Keep original USD amount in the order
        networkFee,
        recipientName,
        recipientStreet,
        recipientCity,
        recipientState,
        recipientCountry,
        giftMessage,
        quantity,
        gift: item.name,
        status: "pending",
        recipientPhone: recipientPhone,
        senderWallet: null,
      };

      console.debug("[orders] saving payload:", orderPayload);
      try {
        await saveOrderToBackend(orderPayload);
      } catch (err) {
        // If client-side save fails, don't treat as fatal — webhook should still save it server-side.
        console.warn("[paystack] client-side order save failed; webhook should handle persistence. Error:", err);
      }

      // success UX
      setShowCardModal(false);
      setShowPaymentChoice(false);
      alert("Card payment successful — order saved (or will be saved shortly).");
      handleClose();
    } catch (err: any) {
      console.error("[paystack] card flow error:", err);
      setError(err?.message || "Card payment failed");
    } finally {
      setLoading(false);
    }
  };

  // sanitize phone input while typing
  const onRecipientPhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setRecipientPhone(digits);
  };

  //
  // IMPORTANT: if modal isn't open, short-circuit rendering so it unmounts cleanly.
  //
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-white/90 backdrop-blur-md w-full max-w-3xl m-4 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
          <button onClick={handleClose} className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c]">
            <X size={24} />
          </button>

          <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[90vh] overflow-y-auto">
            <div className="aspect-square rounded-xl overflow-hidden">
              <img src={item.img ?? ""} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-[#832c2c] mb-1">{item.name}</h3>
              <p className="text-[#832c2c]/70">Unit price: ${unitPrice.toFixed(2)}</p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {relationships.map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setSelectedRelation(rel)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedRelation === rel ? "bg-[#e47a7a] text-white" : "bg-[#fce8e6] text-[#832c2c] hover:bg-[#f6c1c1]"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>

              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Write a message to the recipient..."
                className="w-full h-20 p-3 rounded-xl bg-white/50 border border-[#f6c1c1] focus:border-[#e47a7a] resize-none"
              />

              <div className="space-y-2">
                <Label>Recipient name</Label>
                <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />

                <Label>Recipient phone</Label>
                <input
                  className="w-full p-3 rounded-xl border border-[#f6c1c1]"
                  value={recipientPhone}
                  onChange={(e) => onRecipientPhoneChange(e.target.value)}
                  placeholder="Digits only, e.g. 2348012345678"
                  inputMode="tel"
                />

                <Label>Street</Label>
                <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientStreet} onChange={(e) => setRecipientStreet(e.target.value)} />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>City</Label>
                    <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientState} onChange={(e) => setRecipientState(e.target.value)} />
                  </div>
                </div>

                <Label>Country</Label>
                <input className="w-full p-3 rounded-xl border border-[#f6c1c1]" value={recipientCountry} onChange={(e) => setRecipientCountry(e.target.value)} />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24">
                  <Label>Quantity</Label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full p-3 rounded-xl border border-[#f6c1c1]"
                  />
                </div>

                <div className="flex-1">
                  <Label>Order totals</Label>
                  <div className="p-3 rounded-xl border border-[#f6c1c1] bg-white/50">
                    <div className="flex justify-between text-sm"><span>Subtotal</span><span>${computedAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span>Network fee (2.5%)</span><span>${networkFee.toFixed(2)}</span></div>
                    <div className="flex justify-between font-medium mt-2"><span>Total</span><span>${totalPayable.toFixed(2)}</span></div>
                    <div className="text-xs text-gray-500 mt-1">~{totalPayableSol.toFixed(3)} SOL</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <Label>Payment token</Label>
                <select disabled className="w-full p-3 rounded-xl border border-[#f6c1c1]">
                  <option>Solana (SOL)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <Button onClick={handleClose} className="flex-1 bg-[#fce8e6] text-[#832c2c]">Cancel</Button>

                <Button
                  onClick={onAttemptOpenPaymentChoices}
                  className="flex-1 bg-[#e47a7a] text-white"
                  disabled={!isRecipientFormValid || loading}
                >
                  {loading ? "Processing..." : "Pay / Send Gift"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Choice */}
      {showPaymentChoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPaymentChoice(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
            <button onClick={() => setShowPaymentChoice(false)} className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c]">
              <X size={20} />
            </button>

            <h4 className="text-xl font-semibold text-[#832c2c] mb-2">Choose payment method</h4>
            <p className="text-sm text-gray-600 mb-4">Select how you'd like to pay for this gift.</p>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  setShowPaymentChoice(false);
                  await handleCryptoPayment();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:opacity-95"
              >
                <div>
                  <div className="text-sm font-medium">Pay with crypto</div>
                  <div className="text-xs opacity-80">Pay using your connected Solana wallet (SOL)</div>
                </div>
                <div className="ml-4 text-xs opacity-90">{`${totalPayableSol.toFixed(3)} SOL`}</div>
              </button>

              <button
                onClick={() => setShowCardModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#f6c1c1] bg-white text-[#832c2c] font-medium hover:bg-[#fff2f2]"
              >
                <div>
                  <div className="text-sm font-medium">Pay with card</div>
                  <div className="text-xs opacity-80">Paystack (secure)</div>
                </div>
                <div className="ml-4 text-xs opacity-90">${totalPayable.toFixed(2)}</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Modal (only used to show card UX; actual card entry happens on Paystack page) */}
      {showCardModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCardModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
            <button onClick={() => setShowCardModal(false)} className="absolute right-4 top-4 text-[#832c2c]/70 hover:text-[#832c2c]">
              <X size={20} />
            </button>

            <h4 className="text-lg font-semibold text-[#832c2c] mb-2">Pay with card</h4>
            <p className="text-sm text-gray-600 mb-4">You'll be redirected to Paystack to complete your card payment.</p>

            <div className="space-y-3">
              {/* Keep card inputs visually, but card data is entered on Paystack hosted page */}
              <input placeholder="Card number (optional - Paystack checkout is used)" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full p-3 rounded-lg border border-[#f6c1c1]" inputMode="numeric" />
              <input placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full p-3 rounded-lg border border-[#f6c1c1]" />
              <div className="flex gap-2">
                <input placeholder="MM/YY or MM/YYYY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="flex-1 p-3 rounded-lg border border-[#f6c1c1]" />
                <input placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="w-24 p-3 rounded-lg border border-[#f6c1c1]" inputMode="numeric" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowCardModal(false)} className="flex-1 bg-[#fce8e6] text-[#832c2c]">Cancel</Button>
              <Button onClick={handleCardPayment} className="flex-1 bg-[#e47a7a] text-white" disabled={loading}>
                {loading ? "Processing..." : `Pay ${totalPayable.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login modal shown from GiftModal: disable user-close while shown from here and hide secondary actions */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => setShowLoginModal(false)}
          onSwitchToResetPasswordModal={() => setShowLoginModal(false)}
          setIsLoggedIn={(v) => setIsLoggedIn(v)}
          setUserFullName={() => {}}
          disableClose={true}
          hideSecondaryActions={true}
        />
      )}
    </>
  );
}
