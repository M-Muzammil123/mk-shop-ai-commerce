"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, User, ArrowRight, KeyRound, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

function AuthComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login, register, verifyOtp, isAuthenticated, loading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<"login" | "signup" | "otp" | "forgot">("login");
  const [usePhone, setUsePhone] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otpToken, setOtpToken] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { password };
      if (usePhone) {
        payload.phone = phone;
      } else {
        payload.email = email;
      }
      await login(payload);
      toast.success("Welcome back!");
    } catch (err) {}
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        role: "customer"
      });
      
      toast.success("Account profile registered successfully!");
      if (phone) {
        setMode("otp");
        toast.info("An OTP code has been sent to your phone number.");
      } else {
        setMode("login");
        toast.info("A verification link has been sent to your email.");
      }
    } catch (err) {}
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOtp({ phone, token: otpToken });
      toast.success("OTP verified! You can now log in.");
      setMode("login");
    } catch (err) {}
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        {/* Glass auth card wrapper */}
        <motion.div
          layout
          className="glass-premium p-8 rounded-[36px] shadow-2xl relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            
            {/* 1. LOGIN MODE */}
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold">Welcome Back</h2>
                  <p className="text-xs text-gray-500 mt-2">Enter credentials to open your showroom profile.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Toggle email vs phone login */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setUsePhone(false)}
                      className={`flex-grow py-2 rounded-lg text-center ${!usePhone ? "bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-white" : "text-gray-400"}`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsePhone(true)}
                      className={`flex-grow py-2 rounded-lg text-center ${usePhone ? "bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-white" : "text-gray-400"}`}
                    >
                      Phone Number
                    </button>
                  </div>

                  {!usePhone ? (
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Phone (e.g. +123456789)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[10px] text-gray-400 hover:text-blue-500 font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 text-xs shadow-md"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Google Sign In mock */}
                <div className="relative flex items-center justify-center py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 dark:border-gray-900">
                  <span className="bg-background px-4 absolute">Or Connect With</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    toast.success("Simulated Google authentication success!");
                    // Trigger simple login locally
                    await login({ email: "guest@example.com", password: "mocked_google_sso" });
                  }}
                  className="w-full py-3.5 rounded-full border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-semibold flex items-center justify-center gap-2 text-xs"
                >
                  <Globe className="w-4 h-4 text-blue-500 animate-pulse" /> Google SSO Auth
                </button>

                <div className="text-center text-xs text-gray-500 pt-2">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Sign Up
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. SIGNUP MODE */}
            {mode === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold">Create Account</h2>
                  <p className="text-xs text-gray-500 mt-2">Sign up for exclusive AI product pairing feeds.</p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                        required
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Phone (Optional, for SMS verification)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 text-xs shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="text-center text-xs text-gray-500 pt-2">
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Sign In
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. OTP VERIFICATION MODE */}
            {mode === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold">Verify SMS OTP</h2>
                  <p className="text-xs text-gray-500 mt-2">Enter the verification code sent to {phone}.</p>
                </div>

                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="OTP Code"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 text-center font-bold tracking-widest text-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 text-xs shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Code</>}
                  </button>
                </form>

                <div className="text-center">
                  <button onClick={() => setMode("login")} className="text-xs text-gray-400 hover:underline">
                    Back to Log In
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. FORGOT PASSWORD MODE */}
            {mode === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold">Reset Password</h2>
                  <p className="text-xs text-gray-500 mt-2">Enter email to request reset instructions.</p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await api.post(`/auth/forgot-password?email=${email}`);
                      toast.success("Instructions sent to your email!");
                      setMode("login");
                    } catch (err) {
                      toast.error("Failed to request reset.");
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold flex items-center justify-center gap-2 text-xs shadow-md"
                  >
                    Send Reset Link
                  </button>
                </form>

                <div className="text-center">
                  <button onClick={() => setMode("login")} className="text-xs text-gray-400 hover:underline">
                    Cancel and Back
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs">Loading Auth...</div>}>
      <AuthComponent />
    </Suspense>
  );
}
