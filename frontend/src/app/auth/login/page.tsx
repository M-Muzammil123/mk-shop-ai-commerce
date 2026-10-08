'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || searchParams.get('redirect') || '/app';

  const { setAuth, token, isLoading: authLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If already authenticated, redirect to /app
  useEffect(() => {
    if (!authLoading && token) {
      router.replace(nextParam);
    }
  }, [token, authLoading, nextParam, router]);

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (data) => {
      setIsSuccess(true);
      setAuth(data.access_token, data.profile);
      setTimeout(() => {
        router.push(nextParam);
      }, 400);
    },
    onError: (err) => {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Invalid email or password. Please verify your credentials.'
      );
    },
  });

  const handleFillDemoAdmin = () => {
    setEmail('admin@ecommerce.com');
    setPassword('AdminPassword123!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* LEFT: Brand / Product Visual Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 text-white overflow-hidden p-12 flex-col justify-between border-r border-zinc-800">
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        {/* Top Wordmark & Tagline */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20">
            MK
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight">MK E-COMMERCE AI</span>
            <span className="block text-[11px] font-medium text-zinc-400">
              Autonomous Shopping & Discovery Engine
            </span>
          </div>
        </div>

        {/* Middle Visual: AI Copilot Preview Mock */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-400">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Multi-Agent E-Commerce Intelligence</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              A smarter way to shop, compare, and make purchasing decisions.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Login to access your personal AI shopping copilot, cross-border regional pricing, saved comparisons, and synchronous order tracking.
            </p>
          </div>

          {/* Feature highlights card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-white block">Conversational Product Discovery</span>
                <span className="text-zinc-400">Natural queries mapped to verified merchant inventories.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-7 w-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-white block">Automated Spec & Price Comparison</span>
                <span className="text-zinc-400">Side-by-side matrices generated in real-time.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-white block">Review Sentiment Intelligence</span>
                <span className="text-zinc-400">Aggregated buyer feedback and verified rating breakdown.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-zinc-900 text-xs text-zinc-500">
          <span>Enterprise-grade encryption</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Backend Connected
          </span>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-zinc-950">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-sm">
                MK
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                MK E-COMMERCE AI
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your AI shopping assistant is ready. Sign in to continue.
            </p>
          </div>

          {/* Quick Demo Autofill Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <Zap className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                Want to test? Use the seed <strong>Admin</strong> account.
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline shrink-0 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm"
            >
              Autofill
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Transition */}
          {isSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Session verified! Entering your shopping workspace...</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage('');
              loginMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <Link
                  href="/auth/register"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
                  required
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember this session</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 rounded-xl gap-2 font-bold shadow-md shadow-indigo-600/10"
              isLoading={loginMutation.isPending}
              disabled={isSuccess}
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Social Sign In */}
          <div className="space-y-4 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleLoginButton redirectUrl={nextParam} />
          </div>

          {/* Footer Registration Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-zinc-500">
              Don&apos;t have an account yet?{' '}
              <Link
                href={`/auth/register${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>

          <p className="text-center text-[11px] text-zinc-400 leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/" className="underline hover:text-zinc-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/" className="underline hover:text-zinc-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
