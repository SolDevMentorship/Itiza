// src/pages/PaystackCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function PaystackCallback() {
    const [message, setMessage] = useState("Verifying payment...");
    const navigate = useNavigate();
    useEffect(() => {
        (async () => {
            const q = new URLSearchParams(window.location.search);
            let ref = q.get("reference");
            if (!ref) {
                // maybe stored earlier (in case Paystack didn't include it)
                try {
                    // localStorage.getItem returns string | null — matches our ref type
                    ref = localStorage.getItem("paystack_pending_reference");
                }
                catch (e) {
                    console.warn("Failed to read paystack_pending_reference from localStorage", e);
                    ref = null;
                }
                if (!ref) {
                    setMessage("Missing payment reference. If you were charged, please contact support.");
                    return;
                }
            }
            // normalize
            ref = ref.trim();
            try {
                const apiBaseRaw = (import.meta.env.VITE_API_URL || "").toString();
                const apiBase = apiBaseRaw ? apiBaseRaw.replace(/\/$/, "") : "";
                if (!apiBase) {
                    console.error("VITE_API_URL is not configured");
                    setMessage("Server configuration issue. Please contact support.");
                    return;
                }
                const verifyUrl = `https://itiza-backend.vercel.app/api/paystack/verify?reference=${encodeURIComponent(ref)}`;
                const resp = await fetch(verifyUrl, {
                    credentials: "include",
                });
                let json = null;
                try {
                    json = await resp.json();
                }
                catch {
                    json = null;
                }
                if (resp.ok && json?.success && String(json.data?.status ?? "").toLowerCase() === "success") {
                    setMessage("Payment verified. Saving order...");
                    // optionally call your order save endpoint or navigate to orders page
                    setTimeout(() => navigate("/orders?paystack=success"), 1000);
                    return;
                }
                // Not OK / not success
                console.warn("Paystack verify returned non-success:", resp.status, json);
                setMessage("Payment verification failed or is still pending. If you were charged, we'll finalize the order shortly. Contact support if the money was deducted.");
            }
            catch (err) {
                console.error("Callback verify error:", err);
                setMessage("Error verifying payment. If you were charged, contact support.");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (<div className="p-8 max-w-xl mx-auto">
      <h2 className="text-xl mb-2">Finishing payment...</h2>
      <p>{message}</p>
    </div>);
}
