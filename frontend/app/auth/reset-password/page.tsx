"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../services/api";
import { motion } from "framer-motion";
import { KeyRound, Lock, ArrowRight, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse recovery token from searchParams or hash fragment
    let recoveryToken = searchParams.get("token") || searchParams.get("access_token") || searchParams.get("code") || "";
    
    // Fallback: search window.location.hash for access_token or token
    if (!recoveryToken && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.replace("#", "?"));
        recoveryToken = params.get("access_token") || params.get("token") || "";
      }
    }

    if (recoveryToken) {
      setToken(recoveryToken);
    } else {
      toast.warning("No recovery token found. Please trigger forgot-password link again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Recovery token is missing. Cannot reset password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        password,
      });
      toast.success("Password reset successfully! You can now log in.");
      router.push("/auth");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reset password. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-8 rounded-[36px] shadow-2xl relative overflow-hidden"
        >
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold">Choose New Password</h2>
            <p className="text-xs text-gray-500">Create a new secure password for your Aura account profile.</p>
          </div>

          {!token && (
            <div className="p-4 bg-yellow-100/60 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 rounded-2xl flex items-start gap-2.5 text-xs mb-6">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                We couldn't detect a valid token in the URL. If you came here from a reset link, ensure the full URL is copied correctly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 text-xs rounded-xl border border-gray-250 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 text-xs rounded-xl border border-gray-250 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 text-xs shadow-md"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Reset Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs">Loading Recovery...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
