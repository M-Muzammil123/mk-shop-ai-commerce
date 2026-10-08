'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth-store';
import { useCountryStore } from '@/store/country-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  User,
  MapPin,
  Lock,
  Globe,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const { user, token, setUser, logout } = useAuthStore();
  const { currentCountry } = useCountryStore();
  const queryClient = useQueryClient();

  // Profile Edit State
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Add Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostal, setNewPostal] = useState('');

  // 1. Fetch addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ['profile-addresses'],
    queryFn: authApi.getAddresses,
    enabled: !!token,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: () =>
      authApi.updateMe({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      }),
    onSuccess: (updated) => {
      setUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError('');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err) => {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    },
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: () =>
      authApi.createAddress({
        address_line1: newLine1,
        address_line2: newLine2 || undefined,
        city: newCity,
        state_province: newState || undefined,
        postal_code: newPostal,
        country: currentCountry.code,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-addresses'] });
      setIsAddingAddress(false);
      setNewLine1('');
      setNewLine2('');
      setNewCity('');
      setNewState('');
      setNewPostal('');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-addresses'] }),
  });

  if (!token) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <User className="h-16 w-16 text-zinc-300 mx-auto" />
        <h1 className="text-2xl font-bold">Sign In to Manage Profile</h1>
        <Link href="/auth/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Account & Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your personal details, saved shipping addresses, and security settings.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={logout} className="text-rose-600 hover:text-rose-700">
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Info & Security */}
        <div className="lg:col-span-7 space-y-8">
          {/* Personal Information */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" /> Personal Details
              </h2>
              {user?.role === 'admin' && <Badge variant="ai">Admin Account</Badge>}
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Profile details saved successfully.
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <Input value={user?.email || ''} disabled className="mt-1 bg-zinc-100 dark:bg-zinc-800 opacity-70" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    First Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="mt-1"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => updateProfileMutation.mutate()}
                isLoading={updateProfileMutation.isPending}
                className="mt-2"
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Lock className="h-4 w-4 text-indigo-600" /> Security & Password
            </h2>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Password changed successfully.
              </div>
            )}
            {passwordError && (
              <p className="text-xs text-rose-500 font-medium">{passwordError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => changePasswordMutation.mutate()}
                isLoading={changePasswordMutation.isPending}
                disabled={!oldPassword || !newPassword}
                className="mt-2"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Saved Addresses & Regional Preferences */}
        <div className="lg:col-span-5 space-y-8">
          {/* Saved Addresses */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" /> Saved Addresses
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-xs text-indigo-600"
              >
                {isAddingAddress ? 'Cancel' : '+ Add New'}
              </Button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addAddressMutation.mutate();
                }}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3 text-xs"
              >
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  New Shipping Address ({currentCountry.name})
                </h4>
                <Input
                  placeholder="Street address"
                  value={newLine1}
                  onChange={(e) => setNewLine1(e.target.value)}
                  required
                />
                <Input
                  placeholder="Apartment, suite, unit (optional)"
                  value={newLine2}
                  onChange={(e) => setNewLine2(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="State / Province"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Postal Code"
                  value={newPostal}
                  onChange={(e) => setNewPostal(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={addAddressMutation.isPending}
                  className="w-full"
                >
                  Save Address
                </Button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-xs text-zinc-400">
                No saved shipping addresses yet.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {addr.address_line1} {addr.address_line2}
                      </p>
                      <p className="text-zinc-500 mt-0.5">
                        {addr.city}, {addr.state_province} {addr.postal_code}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {addr.country}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteAddressMutation.mutate(addr.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regional Settings Card */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3 shadow-xs">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600" /> Active Regional Market
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              You are currently browsing verified listings for{' '}
              <strong>{currentCountry.name}</strong> ({currentCountry.currency}).
            </p>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span className="text-xl">{currentCountry.flag}</span>
                <span>{currentCountry.name}</span>
              </span>
              <span className="font-mono text-zinc-500">
                {currentCountry.currency} ({currentCountry.symbol})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
