import { create } from 'zustand';

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  rateFromUSD: number; // For client display conversion if needed
  shippingAvailable: boolean;
  standardDeliveryDays: string;
}

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    currency: 'PKR',
    symbol: 'Rs',
    rateFromUSD: 278.5,
    shippingAvailable: true,
    standardDeliveryDays: '2-4 business days',
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    rateFromUSD: 1.0,
    shippingAvailable: true,
    standardDeliveryDays: '3-5 business days',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    rateFromUSD: 0.78,
    shippingAvailable: true,
    standardDeliveryDays: '3-6 business days',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED',
    rateFromUSD: 3.67,
    shippingAvailable: true,
    standardDeliveryDays: '2-5 business days',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    symbol: 'SAR',
    rateFromUSD: 3.75,
    shippingAvailable: true,
    standardDeliveryDays: '3-5 business days',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'CA$',
    rateFromUSD: 1.36,
    shippingAvailable: true,
    standardDeliveryDays: '4-7 business days',
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    symbol: '€',
    rateFromUSD: 0.92,
    shippingAvailable: true,
    standardDeliveryDays: '3-5 business days',
  },
];

interface CountryState {
  currentCountry: CountryInfo;
  setCountry: (code: string) => void;
  formatPrice: (amount: number | string, baseCurrency?: string) => string;
}

export const useCountryStore = create<CountryState>((set, get) => ({
  currentCountry: SUPPORTED_COUNTRIES[0], // Defaults to PK as defined in backend

  setCountry: (code: string) => {
    const found = SUPPORTED_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (found) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mk_selected_country', found.code);
      }
      set({ currentCountry: found });
    }
  },

  formatPrice: (amount: number | string, baseCurrency?: string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$0.00';

    const { currentCountry } = get();

    // If base currency matches target currency or is explicitly stated
    if (baseCurrency && baseCurrency.toUpperCase() === currentCountry.currency) {
      return `${currentCountry.symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Default formatting in target country's currency
    return `${currentCountry.symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
}));
