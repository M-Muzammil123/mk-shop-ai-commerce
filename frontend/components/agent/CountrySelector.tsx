"use client";

import React from "react";
import { Globe } from "lucide-react";

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD" },
];

interface CountrySelectorProps {
  selectedCountry: string;
  onSelectCountry: (country: CountryOption) => void;
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelectCountry,
  className = "",
}) => {
  const current =
    SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry.toUpperCase()) ||
    SUPPORTED_COUNTRIES[0];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-md">
        <span className="text-base">{current.flag}</span>
        <select
          value={current.code}
          onChange={(e) => {
            const chosen = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
            if (chosen) onSelectCountry(chosen);
          }}
          className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer pr-1"
          aria-label="Select Shopping Country"
        >
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code} className="dark:bg-gray-900 text-gray-900 dark:text-white">
              {c.flag} {c.name} ({c.currency})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
