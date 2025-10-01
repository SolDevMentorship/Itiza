// src/components/modals/ResetPasswordModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
const ResetPasswordModal = ({ isOpen, onClose, prefillEmail = "" }) => {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState(prefillEmail ?? "");
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const emailRef = useRef(null);
    // Portal node ref
    const portalNodeRef = useRef(null);
    useEffect(() => {
        portalNodeRef.current = document.createElement("div");
        portalNodeRef.current.setAttribute("id", "reset-password-modal-root");
        document.body.appendChild(portalNodeRef.current);
        setMounted(true);
        return () => {
            if (portalNodeRef.current) {
                document.body.removeChild(portalNodeRef.current);
                portalNodeRef.current = null;
            }
            setMounted(false);
        };
    }, []);
    // Prefill from prop or localStorage and reset state when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => emailRef.current?.focus(), 80);
            setStep("email");
            setOtp("");
            setGeneratedOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage(null);
            // prefer prop, then localStorage
            if (prefillEmail && prefillEmail.trim()) {
                setEmail(prefillEmail);
            }
            else {
                try {
                    const pref = localStorage.getItem("prefillEmail");
                    if (pref)
                        setEmail(pref);
                }
                catch { }
            }
        }
    }, [isOpen, prefillEmail]);
    // API base (fallback)
    // const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
    const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
    const sendOtp = async () => {
        setMessage(null);
        const value = (email ?? "").toString().trim();
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setMessage({ type: "error", text: "Please enter a valid email address." });
            return;
        }
        setLoading(true);
        try {
            const otpToSend = makeOtp();
            setGeneratedOtp(otpToSend);
            // Send OTP to server (server-side will just forward the email for now)
            const res = await fetch(`https://itiza-backend.vercel.app/api/sendOTP`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: value, otp: otpToSend }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok)
                throw new Error(data.error || `Failed to send OTP (status ${res.status})`);
            setMessage({ type: "success", text: "OTP sent — check your email." });
            setStep("reset");
            // persist prefill for convenience
            try {
                localStorage.setItem("prefillEmail", value);
            }
            catch { }
        }
        catch (err) {
            console.error("sendOtp error", err);
            setMessage({ type: "error", text: err?.message || "Failed to send OTP." });
        }
        finally {
            setLoading(false);
        }
    };
    const performReset = async () => {
        setMessage(null);
        // client-side checks
        if (!otp || otp.length !== 6) {
            setMessage({ type: "error", text: "Enter the 6-digit OTP sent to your email." });
            return;
        }
        if (generatedOtp && otp !== generatedOtp) {
            setMessage({ type: "error", text: "Incorrect OTP. Please check your email." });
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setMessage({ type: "error", text: "New password must be at least 6 characters." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match." });
            return;
        }
        setLoading(true);
        try {
            const payload = {
                customerID: (email ?? "").toString().toLowerCase().trim(), // customerID is email
                newPassword,
                otp, // optional; backend should verify if implemented
            };
            const res = await fetch(`https://itiza-backend.vercel.app/api/resetPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const errMsg = data?.error || data?.message || `Failed to reset (status ${res.status})`;
                throw new Error(errMsg);
            }
            setMessage({ type: "success", text: "Password reset successful. You can now log in using your new password." });
            // small delay so user sees success message
            setTimeout(() => {
                onClose();
            }, 1200);
        }
        catch (err) {
            console.error("performReset error", err);
            setMessage({ type: "error", text: err?.message || "Failed to reset password." });
        }
        finally {
            setLoading(false);
        }
    };
    const handleClose = () => {
        setStep("email");
        setOtp("");
        setGeneratedOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage(null);
        onClose();
    };
    if (!mounted || !portalNodeRef.current)
        return null;
    return createPortal(<Dialog open={isOpen} onClose={handleClose} className="fixed inset-0 z-[99999] overflow-y-auto" aria-label="Reset password dialog">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[99998]" aria-hidden="true"/>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-[100000] mx-auto" role="dialog" aria-modal="true">
          <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Close" disabled={loading}>
            <X className="w-5 h-5"/>
          </button>

          <Dialog.Title className="text-2xl font-bold text-pink-600 text-center mb-4">Reset Password 🔒</Dialog.Title>

          {message && (<div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-100 border border-red-400 text-red-700" : "bg-green-50 border border-green-200 text-green-800"}`}>
              {message.text}
            </div>)}

          {step === "email" ? (<form onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
            }}>
              <p className="text-sm text-gray-700 mb-4 text-center">
                Enter the email associated with your Itiza account. We'll send a verification code to that address.
              </p>

              <input ref={emailRef} type="email" placeholder="Email" className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} autoComplete="email"/>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>) : (<form onSubmit={(e) => {
                e.preventDefault();
                performReset();
            }}>
              <p className="text-sm text-gray-700 mb-3 text-center">Enter the 6-digit code we sent, then choose a new password.</p>

              <input type="text" placeholder="Enter OTP" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3 border border-pink-200 rounded-lg text-center text-xl font-mono tracking-wider mb-3" disabled={loading} inputMode="numeric" aria-label="One-time code"/>

              <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-pink-200 rounded-lg mb-3" disabled={loading} autoComplete="new-password" aria-label="New password"/>

              <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-pink-200 rounded-lg mb-4" disabled={loading} autoComplete="new-password" aria-label="Confirm new password"/>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button type="button" onClick={() => {
                setStep("email");
                setOtp("");
                setGeneratedOtp("");
                setMessage(null);
            }} className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 text-sm underline" disabled={loading}>
                ← Back
              </button>
            </form>)}
        </div>
      </div>
    </Dialog>, portalNodeRef.current);
};
export default ResetPasswordModal;
