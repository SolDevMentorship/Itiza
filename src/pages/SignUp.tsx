

// src/components/modals/SignUpModal.tsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get API URL from environment variable or fallback to localhost
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtpToEmail = async (email: string, otp: string) => {
    try {
      console.log("🚀 Sending OTP to:", email);
      console.log("📡 API URL:", `${API_URL}/Itiza_Delivery/sendOTP`);
      
      const res = await fetch(`${API_URL}/Itiza_Delivery/sendOTP`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      console.log("📥 Response status:", res.status);
      const data = await res.json();
      console.log("📥 Response data:", data);

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to send OTP`);
      }

      console.log("✅ OTP sent successfully");
      return data;
    } catch (err: any) {
      console.error("❌ Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message}`);
      throw err;
    }
  };

  const handleOtpVerification = async () => {
    if (otpInput !== serverOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔐 Verifying OTP and creating account...");
      
      const response = await fetch(`${API_URL}/Itiza_Delivery/auth/signup`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password: password1,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Signup successful");
        alert("Sign up successful! Welcome to Itiza! 🎉");
        onClose();
        // Reset form
        setFullName("");
        setEmail("");
        setPassword1("");
        setPassword2("");
        setOtpSent(false);
        setOtpInput("");
        setServerOtp("");
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password1.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password1 !== password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const otp = generateOTP();
      console.log("🔢 Generated OTP:", otp); // Remove this in production
      setServerOtp(otp);
      
      await sendOtpToEmail(email, otp);
      setOtpSent(true);
      console.log("✅ OTP sent, showing verification screen");
    } catch (err) {
      // Error already handled in sendOtpToEmail
    } finally {
      setLoading(false);
    }
  };

  const resetToSignup = () => {
    setOtpSent(false);
    setOtpInput("");
    setServerOtp("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-50">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>

          <Dialog.Title className="text-3xl font-bold text-pink-600 text-center mb-6">
            Create an Account 💝
          </Dialog.Title>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Sending OTP..." : "Send OTP 📧"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleOtpVerification(); }}>
              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  We sent a 6-digit OTP to
                </p>
                <p className="font-semibold text-pink-600">{email}</p>
              </div>
              
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 border border-pink-200 rounded-lg text-center text-xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} // Only allow digits
                required
              />
              
              <button
                type="submit"
                disabled={loading || otpInput.length !== 6}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Verifying..." : "Verify & Sign Up ✅"}
              </button>
              
              <button
                type="button"
                onClick={resetToSignup}
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm underline"
              >
                ← Back to Sign Up
              </button>
            </form>
          )}

          <p className="text-sm text-center mt-5 text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-pink-500 font-medium hover:underline">
              Log in
            </button>
          </p>

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              API URL: {API_URL}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default SignUpModal;