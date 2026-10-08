'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useCountryStore, SUPPORTED_COUNTRIES } from '@/store/country-store';
import { Check, ShieldCheck, Truck } from 'lucide-react';

export function CountrySelectorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { currentCountry, setCountry } = useCountryStore();

  const handleSelect = (code: string) => {
    setCountry(code);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Your Region & Currency"
      description="Pricing, shipping options, and AI agent discovery will be tailored to your location."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2.5">
          {SUPPORTED_COUNTRIES.map((country) => {
            const isSelected = currentCountry.code === country.code;
            return (
              <button
                key={country.code}
                onClick={() => handleSelect(country.code)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {country.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                        {country.currency} ({country.symbol})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-emerald-600" />
                        {country.standardDeliveryDays}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">Verified Shipping</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-3.5 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
          <p>
            When you switch country, the AI Shopping Agent automatically shifts to verified regional merchants and enforces local currency pricing and stock availability.
          </p>
        </div>
      </div>
    </Modal>
  );
}
