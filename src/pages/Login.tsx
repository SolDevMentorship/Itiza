


// src/components/modals/LoginModal.tsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserFullName: (fullName: string) => void;
}

const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  setIsLoggedIn,
  setUserFullName,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateInput = () => {
    if (!email || !password) {
      setErrorMessage("Email and password are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateInput()) return;

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:4000/Itiza_Delivery/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);
      const userEmail = data.user?.email;

      console.log("Saving email:", userEmail);
      localStorage.setItem("userEmail", userEmail);

      if (res.ok) {
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        setIsLoggedIn(true);

        if (data.user?.fullName) {
          setUserFullName(data.user.fullName); // ✅ Extract and store first name
        }

        setEmail("");
        setPassword("");

        alert("Login successful!");
        onClose();
      } else {
        setIsLoggedIn(false);
        setErrorMessage(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Network error. Please check your connection and try again.");
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-50">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-pink-500"
            aria-label="Close"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>

          <Dialog.Title className="text-3xl font-bold text-pink-600 text-center mb-6">
            Welcome Back 🎀
          </Dialog.Title>

          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            {errorMessage && (
              <p className="text-red-500 text-sm text-center">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

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
        </div>
      </div>
    </Dialog>
  );
};

export default LoginModal;
