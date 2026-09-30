"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GoogleLoginButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
  onSuccess?: () => void;
  className?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  text = "continue_with",
  onSuccess,
  className = "",
}) => {
  const { loginWithGoogle, loading } = useAuthStore();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const codeClientRef = useRef<any>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Load the Google Identity Services SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.google?.accounts) {
        setScriptLoaded(true);
        return;
      }

      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () =>
          console.error("Failed to load Google Identity Services SDK");
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => setScriptLoaded(true));
      }
    }
  }, []);

  // Handle the authorization code received from Google popup
  const handleCodeResponse = useCallback(
    async (response: any) => {
      if (!response?.code) {
        toast.error("Google authentication did not return a valid code.");
        return;
      }

      try {
        setIsProcessing(true);
        await loginWithGoogle({
          code: response.code,
          redirect_uri: "postmessage",
        });
        toast.success("Successfully authenticated with Google!");
        onSuccess?.();
      } catch (err: any) {
        toast.error(err.message || "Failed to log in with Google");
      } finally {
        setIsProcessing(false);
      }
    },
    [loginWithGoogle, onSuccess]
  );

  // Initialize the popup-based OAuth code client (no redirect URI needed)
  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.oauth2) return;

    codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: googleClientId,
      scope: "openid email profile",
      ux_mode: "popup",
      callback: handleCodeResponse,
    });
  }, [scriptLoaded, googleClientId, handleCodeResponse]);

  // Trigger popup OAuth flow
  const handleClick = () => {
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    } else {
      toast.error("Google SDK not loaded yet. Please try again.");
    }
  };

  const buttonLabel =
    text === "signup_with"
      ? "Sign up with Google"
      : text === "signin_with"
      ? "Sign in with Google"
      : "Continue with Google";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || isProcessing}
      className={`w-full py-3 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold flex items-center justify-center gap-3 text-xs text-gray-700 dark:text-gray-200 shadow-sm active:scale-[0.99] disabled:opacity-50 ${className}`}
    >
      {loading || isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{buttonLabel}</span>
    </button>
  );
};

export default GoogleLoginButton;
