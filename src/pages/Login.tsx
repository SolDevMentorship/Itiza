
// src/components/modals/LoginModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToResetPasswordModal: () => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserFullName: (fullName: string) => void;
  disableClose?: boolean;
  hideSecondaryActions?: boolean; // NEW: hide "Forgot password?" and "Sign up" when true
}

// const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToResetPasswordModal,
  setIsLoggedIn,
  setUserFullName,
  disableClose = false,
  hideSecondaryActions = false,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const identifierRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const prefill = localStorage.getItem("prefillEmail");
      if (prefill) setIdentifier(prefill);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => identifierRef.current?.focus(), 80);
      return () => clearTimeout(t);
    } else {
      abortRef.current?.abort();
      abortRef.current = null;
    }
  }, [isOpen]);

  const validateInput = () => {
    if (!identifier || !password) {
      setErrorMessage("Email/Customer ID and password are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const customerIDRegex = /^[a-zA-Z0-9_.-]{3,}$/;

    if (!emailRegex.test(identifier) && !customerIDRegex.test(identifier)) {
      setErrorMessage("Please enter a valid email or customer ID");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const fetchCurrentUser = async (signal?: AbortSignal) => {
    try {
      const resp = await fetch(`https://itiza-backend.vercel.app/api/authMe`, {
        method: "GET",
        credentials: "include",
        signal,
        headers: { Accept: "application/json" },
      });
      if (!resp.ok) return null;
      const j = await resp.json().catch(() => null);
      return j?.user ?? null;
    } catch (err) {
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validateInput()) return;

    setIsLoading(true);
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    try {
      const normalized = identifier.toLowerCase().trim();

      const bodyPayload = {
        identifier: normalized,
        customerID: normalized,
        password,
      };

      const res = await fetch(`https://itiza-backend.vercel.app/api/loginUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyPayload),
        signal,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned unexpected response: ${res.status} ${text}`);
      }

      const userIdentifier = data?.user?.customerID ?? data?.user?.email ?? normalized;
      try {
        if (userIdentifier) localStorage.setItem("userIdentifier", userIdentifier);
      } catch (e) {}

      if (res.ok) {
        if (data?.token) {
          try {
            localStorage.setItem("authToken", data.token);
          } catch (e) {}
        }

        const canonicalUser = await fetchCurrentUser(signal);
        if (canonicalUser) {
          if (canonicalUser.fullName) setUserFullName(canonicalUser.fullName);
          setIsLoggedIn(true);
          try {
            localStorage.setItem("user", JSON.stringify(canonicalUser));
          } catch (e) {}
        } else if (data?.user) {
          if (data.user.fullName) setUserFullName(data.user.fullName);
          setIsLoggedIn(true);
          try {
            localStorage.setItem("user", JSON.stringify(data.user));
          } catch (e) {}
        } else {
          setIsLoggedIn(false);
        }

        setIdentifier("");
        setPassword("");
        onClose(); // programmatic close allowed even if disableClose is true
      } else {
        setIsLoggedIn(false);
        const serverMsg = data?.error ?? data?.message ?? "Login failed. Please try again.";
        setErrorMessage(serverMsg);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.info("Login request aborted");
      } else {
        console.error("Login error:", err);
        setErrorMessage(err?.message ?? "Network error. Please try again.");
        setIsLoggedIn(false);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIdentifier("");
    setPassword("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={disableClose ? () => {} : handleClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-dialog-title"
        >
          <button
            onClick={disableClose ? undefined : handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-pink-500"
            aria-label="Close"
            disabled={isLoading || disableClose}
          >
            <X className="h-5 w-5" />
          </button>

          <Dialog.Title id="login-dialog-title" className="text-3xl font-bold text-pink-600 text-center mb-6">
            Welcome Back 🎀
          </Dialog.Title>

          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              ref={identifierRef}
              type="text"
              placeholder="Email or Customer ID"
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              aria-label="Email or Customer ID"
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-label="Password"
              required
            />

            {errorMessage && <p className="text-red-500 text-sm text-center" role="alert">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {!hideSecondaryActions && (
            <>
              <p className="text-sm text-center mt-3">
                <button
                  onClick={() => {
                    try { localStorage.setItem("prefillEmail", identifier.trim()); } catch {}
                    onSwitchToResetPasswordModal();
                  }}
                  className="text-blue-500 font-medium hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </p>

              <p className="text-sm text-center mt-5 text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToSignup}
                  className="text-pink-500 font-medium hover:underline"
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default LoginModal;
