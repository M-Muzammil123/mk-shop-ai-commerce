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
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Bot,
  Zap,
} from 'lucide-react';

function calculatePasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pass) return { score: 0, label: '', color: 'bg-zinc-200 dark:bg-zinc-800' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (pass.length >= 12) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || searchParams.get('redirect') || '/app';

  const { setAuth, token, isLoading: authLoading } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If already authenticated, redirect to /app
  useEffect(() => {
    if (!authLoading && token) {
      router.replace(nextParam);
    }
  }, [token, authLoading, nextParam, router]);

  const passwordStrength = calculatePasswordStrength(password);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!termsAccepted) {
        throw new Error('Please accept the Terms of Service to create an account');
      }

      // 1. Register with backend
      await authApi.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName || undefined,
        phone: phone || undefined,
        role: 'customer',
      });

      // 2. Automatically log in to obtain JWT token
      const tokenRes = await authApi.login({ email, password });
      return tokenRes;
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      setAuth(data.access_token, data.profile);
      setTimeout(() => {
        router.push(nextParam);
      }, 400);
    },
    onError: (err) => {
      setErrorMessage(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      );
    },
  });

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* LEFT: Brand / Product Visual Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 text-white overflow-hidden p-12 flex-col justify-between border-r border-zinc-800">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        {/* Top Wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-purple-500/20">
            MK
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight">MK E-COMMERCE AI</span>
            <span className="block text-[11px] font-medium text-zinc-400">
              Autonomous Shopping & Discovery Engine
            </span>
          </div>
        </div>

        {/* Middle Visual */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-medium text-purple-400">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Personalized AI Copilot Experience</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Create an account and start shopping with autonomous AI agents.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Unlock saved conversational sessions, persistent multi-product comparisons, tailored budget recommendations, and synchronous cart management.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-white block">Continuous Shopping Sessions</span>
                <span className="text-zinc-400">Your AI assistant remembers past research and constraints.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-white block">One-Click Cart Optimization</span>
                <span className="text-zinc-400">AI finds coupon deals and budget alternatives in real-time.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-zinc-900 text-xs text-zinc-500">
          <span>GDPR & Privacy Compliant</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="h-4 w-4" /> 100% Verified Secure
          </span>
        </div>
      </div>

      {/* RIGHT: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-zinc-950 overflow-y-auto">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="lg:hidden flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-sm">
                MK
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                MK E-COMMERCE AI
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Create an account
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Join MK to start shopping smarter with AI assistance.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notification */}
          {isSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Account created successfully! Preparing your dashboard...</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage('');
              registerMutation.mutate();
            }}
            className="space-y-3.5"
          >
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  First Name
                </label>
                <Input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<User className="h-4 w-4 text-zinc-400" />}
                  required
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Last Name
                </label>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
                required
                className="h-10 rounded-xl"
              />
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="h-4 w-4 text-zinc-400" />}
                className="h-10 rounded-xl"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
                  required
                  className="h-10 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="pt-1 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>Strength: {passwordStrength.label}</span>
                    <span>Use 8+ chars, numbers & symbols</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
                required
                className="h-10 rounded-xl"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-rose-500 font-medium">Passwords do not match</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                />
                <span className="leading-tight">
                  I agree to the{' '}
                  <Link href="/" className="font-semibold text-indigo-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link href="/" className="font-semibold text-indigo-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 rounded-xl gap-2 font-bold shadow-md shadow-indigo-600/10 mt-2"
              isLoading={registerMutation.isPending}
              disabled={isSuccess || !termsAccepted}
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Social Auth */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  Or sign up with
                </span>
              </div>
            </div>

            <GoogleLoginButton redirectUrl={nextParam} />
          </div>

          <div className="text-center pt-1">
            <p className="text-xs text-zinc-500">
              Already have an account?{' '}
              <Link
                href={`/auth/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
