"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, MapPin, Plus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Address {
  id: string;
  title: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function SettingsPage() {
  const { isAuthenticated, user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "addresses">("profile");

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  
  // New Address Form States
  const [addressTitle, setAddressTitle] = useState("Home");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [addAddressLoading, setAddAddressLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "addresses") {
      loadAddresses();
    }
  }, [isAuthenticated, activeTab]);

  async function loadAddresses() {
    setAddressLoading(true);
    try {
      const res = await api.get("/auth/addresses");
      setAddresses(res.data || []);
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setAddressLoading(false);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put("/auth/me", {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      });
      updateProfile(res.data);
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post("/auth/change-password", {
        new_password: newPassword,
      });
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAddressLoading(true);
    try {
      await api.post("/auth/addresses", {
        title: addressTitle,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        postal_code: postalCode,
        country,
        is_default: isDefaultAddress,
      });
      toast.success("Address added successfully!");
      setShowAddAddress(false);
      // Reset fields
      setAddressTitle("Home");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("");
      setIsDefaultAddress(false);
      // Reload address list
      loadAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add address");
    } finally {
      setAddAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`/auth/addresses/${id}`);
      toast.success("Address deleted successfully!");
      loadAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete address");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-xs text-gray-500 max-w-sm">
            Please log in to your account to modify user profiles, default shipping locations, and security credentials.
          </p>
        </div>
        <Link href="/auth?redirect=/settings" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-all">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Personal Information", icon: User },
    { id: "password", label: "Security & Password", icon: Shield },
    { id: "addresses", label: "Address Book", icon: MapPin },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-12 border-b border-gray-150 dark:border-gray-850 pb-6">
        <h1 className="text-3xl font-extrabold">Account Settings</h1>
        <p className="text-xs text-gray-550 mt-1">Manage your identity, security parameters, and address registry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar navigation */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${activeTab === tab.id ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "hover:bg-gray-150 dark:hover:bg-gray-850 text-gray-650"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Settings panel area */}
        <div className="md:col-span-3">
          <motion.div
            layout
            className="glass-premium p-8 rounded-[36px]"
          >
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Personal Profile */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold">Personal Profile</h2>
                    <p className="text-xs text-gray-500 mt-1">Update your basic metadata used for catalog deliveries.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-450">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-450">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-450">Email Address (Read Only)</label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/60 outline-none cursor-not-allowed text-gray-400"
                        disabled
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-450">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1234567890"
                        className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile Details"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Tab 2: Security & Password */}
              {activeTab === "password" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold">Change Password</h2>
                    <p className="text-xs text-gray-500 mt-1">Create a robust authentication password to guard your private profile details.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-450">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-450">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 outline-none focus:ring-1 focus:ring-blue-500"
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Tab 3: Addresses */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Address Book</h2>
                      <p className="text-xs text-gray-500 mt-1">Register default destinations for checkout dispatch pipelines.</p>
                    </div>

                    {!showAddAddress && (
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="px-4 py-2 border border-gray-250 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Address
                      </button>
                    )}
                  </div>

                  {showAddAddress ? (
                    <form onSubmit={handleAddAddress} className="space-y-4 bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-gray-200 dark:border-gray-850">
                      <h3 className="font-bold text-sm">New Delivery Address</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Address Label</label>
                          <input
                            type="text"
                            value={addressTitle}
                            onChange={(e) => setAddressTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Country</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Street Address</label>
                        <input
                          type="text"
                          placeholder="Line 1"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Line 2 (Apt, Suite, Unit)"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">State / Region</label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Postal Code</label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none"
                            required
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer py-1.5">
                        <input
                          type="checkbox"
                          checked={isDefaultAddress}
                          onChange={(e) => setIsDefaultAddress(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-700"
                        />
                        <span className="text-xs text-gray-500">Set as default dispatch address</span>
                      </label>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={addAddressLoading}
                          className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-full text-xs font-semibold flex items-center gap-1.5"
                        >
                          {addAddressLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Address"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(false)}
                          className="px-6 py-2.5 border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : addressLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <p className="text-xs italic text-gray-500 py-6 text-center">No addresses registered yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-gray-150 dark:border-gray-850 flex justify-between items-start"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">{addr.title}</span>
                              {addr.is_default && (
                                <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {addr.address_line1} {addr.address_line2 && `, ${addr.address_line2}`}<br />
                              {addr.city}, {addr.state} {addr.postal_code}<br />
                              {addr.country}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:scale-105 transition-all"
                            title="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>

      </div>
      
    </div>
  );
}
