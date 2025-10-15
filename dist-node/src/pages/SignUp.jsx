// import { useState } from "react";
// interface SignUpModalProps {
//   onClose: () => void;
//   onSwitchToLogin: () => void;
// }
// export default function SignUpModal({ onClose, onSwitchToLogin }: SignUpModalProps) {
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [confirmEmail, setConfirmEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [generatedOtp, setGeneratedOtp] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
//   const sendOtpToEmail = async (email: string, otp: string) => {
//     try {
//       console.log("🚀 Sending OTP to:", email);
//       console.log("📡 API URL:", "https://afonet-backend.vercel.app/api/sendOTP");
//       const res = await fetch("https://afonet-backend.vercel.app/api/sendOTP", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ email, otp }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || data.message || "Failed to send OTP");
//       }
//       return data;
//     } catch (err: any) {
//       throw new Error(err?.message || "Network error");
//     }
//   };
//   async function sendOtp() {
//     setError(null);
//     setMessage(null);
//     if (!email || !confirmEmail) {
//       setError("Please enter and confirm your email");
//       return;
//     }
//     if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
//       setError("Emails do not match");
//       return;
//     }
//     setLoading(true);
//     try {
//       const otp = generateOTP();
//       setGeneratedOtp(otp);
//       await sendOtpToEmail(email.trim().toLowerCase(), otp);
//       setOtpSent(true);
//       setMessage("OTP sent to your email. It expires in 15 minutes.");
//     } catch (err: any) {
//       setError(err?.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   }
//   async function handleSignUp() {
//     setError(null);
//     setMessage(null);
//     if (!fullName || !email || !password || !phoneNumber) {
//       setError("All fields are required");
//       return;
//     }
//     if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
//       setError("Emails do not match");
//       return;
//     }
//     if (!otpSent) {
//       setError("Please request and enter the OTP sent to your email before signing up");
//       return;
//     }
//     // Verify OTP matches
//     if (otp !== generatedOtp) {
//       setError("Invalid OTP. Please check and try again.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const payload = {
//         userID: email.trim().toLowerCase(),
//         fullName,
//         password,
//         phoneNumber: phoneNumber.replace(/[^0-9+]/g, ""),
//       };
//       const res = await fetch("https://afonet-backend.vercel.app/api/auth", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error || data.message || "Signup failed");
//       } else {
//         setMessage("Signup successful. You can now log in.");
//         setTimeout(() => {
//           onClose();
//           onSwitchToLogin();
//         }, 1200);
//       }
//     } catch (err: any) {
//       setError(err?.message || "Network error");
//     } finally {
//       setLoading(false);
//     }
//   }
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
//       <div className="bg-gradient-to-r from-[#000022] via-[#0000FF] to-[#000022] p-6 rounded-lg text-white w-80 space-y-4 shadow-lg relative">
//         <h2 className="text-xl font-bold text-center">Sign Up</h2>
//         <input
//           type="text"
//           placeholder="Full Name"
//           value={fullName}
//           onChange={(e) => setFullName(e.target.value)}
//           className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"
//         />
//         <input
//           type="email"
//           placeholder="Confirm Email"
//           value={confirmEmail}
//           onChange={(e) => setConfirmEmail(e.target.value)}
//           className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"
//         />
//         <input
//           type="tel"
//           placeholder="Phone number"
//           value={phoneNumber}
//           onChange={(e) => setPhoneNumber(e.target.value)}
//           className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"
//         />
//         {!otpSent ? (
//           <button
//             onClick={sendOtp}
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold transition disabled:opacity-60"
//           >
//             {loading ? "Sending OTP..." : "Send OTP"}
//           </button>
//         ) : (
//           <>
//             <input
//               type="text"
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"
//             />
//             <button
//               onClick={handleSignUp}
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold transition disabled:opacity-60"
//             >
//               {loading ? "Signing up..." : "Verify & Sign Up"}
//             </button>
//           </>
//         )}
//         {error && <div className="text-sm text-red-300">{error}</div>}
//         {message && <div className="text-sm text-green-300">{message}</div>}
//         <p className="text-center text-sm">
//           Already have an account?{' '}
//           <button onClick={onSwitchToLogin} className="text-blue-300 hover:underline">
//             Login
//           </button>
//         </p>
//         <button onClick={onClose} className="absolute top-2 right-3 text-white text-xl">&times;</button>
//       </div>
//     </div>
//   );
// }
// src/pages/SignUp.tsx
import { useState } from "react";
export default function SignUpModal({ isOpen = true, onClose, onSwitchToLogin }) {
    // short-circuit if not open (keeps consumer usage simple)
    if (!isOpen)
        return null;
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
    const sendOtpToEmail = async (email, otp) => {
        try {
            console.log("🚀 Sending OTP to:", email);
            console.log("📡 API URL:", "https://afonet-backend.vercel.app/api/sendOTP");
            const res = await fetch("https://afonet-backend.vercel.app/api/sendOTP", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || "Failed to send OTP");
            }
            return data;
        }
        catch (err) {
            throw new Error(err?.message || "Network error");
        }
    };
    async function sendOtp() {
        setError(null);
        setMessage(null);
        if (!email || !confirmEmail) {
            setError("Please enter and confirm your email");
            return;
        }
        if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
            setError("Emails do not match");
            return;
        }
        setLoading(true);
        try {
            const otp = generateOTP();
            setGeneratedOtp(otp);
            await sendOtpToEmail(email.trim().toLowerCase(), otp);
            setOtpSent(true);
            setMessage("OTP sent to your email. It expires in 15 minutes.");
        }
        catch (err) {
            setError(err?.message || "Failed to send OTP");
        }
        finally {
            setLoading(false);
        }
    }
    async function handleSignUp() {
        setError(null);
        setMessage(null);
        if (!fullName || !email || !password || !phoneNumber) {
            setError("All fields are required");
            return;
        }
        if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
            setError("Emails do not match");
            return;
        }
        if (!otpSent) {
            setError("Please request and enter the OTP sent to your email before signing up");
            return;
        }
        // Verify OTP matches
        if (otp !== generatedOtp) {
            setError("Invalid OTP. Please check and try again.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                userID: email.trim().toLowerCase(),
                fullName,
                password,
                phoneNumber: phoneNumber.replace(/[^0-9+]/g, ""),
            };
            const res = await fetch("https://afonet-backend.vercel.app/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || data.message || "Signup failed");
            }
            else {
                setMessage("Signup successful. You can now log in.");
                setTimeout(() => {
                    onClose();
                    onSwitchToLogin();
                }, 1200);
            }
        }
        catch (err) {
            setError(err?.message || "Network error");
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-[#000022] via-[#0000FF] to-[#000022] p-6 rounded-lg text-white w-80 space-y-4 shadow-lg relative">
        <h2 className="text-xl font-bold text-center">Sign Up</h2>

        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"/>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"/>

        <input type="email" placeholder="Confirm Email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"/>

        <input type="tel" placeholder="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"/>

        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"/>

        {!otpSent ? (<button onClick={sendOtp} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold transition disabled:opacity-60">
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>) : (<>
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-2 rounded bg-black bg-opacity-40 border border-blue-400 text-white"/>

            <button onClick={handleSignUp} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold transition disabled:opacity-60">
              {loading ? "Signing up..." : "Verify & Sign Up"}
            </button>
          </>)}

        {error && <div className="text-sm text-red-300">{error}</div>}
        {message && <div className="text-sm text-green-300">{message}</div>}

        <p className="text-center text-sm">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-blue-300 hover:underline">
            Login
          </button>
        </p>

        <button onClick={onClose} className="absolute top-2 right-3 text-white text-xl">&times;</button>
      </div>
    </div>);
}
