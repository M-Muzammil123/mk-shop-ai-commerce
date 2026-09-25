"use client";

import React, { useState } from "react";
import { CheckoutConfirmResponse, PaymentConfirmResponse, agentService } from "../../services/agent";
import { ShieldCheck, CheckCircle2, AlertTriangle, Loader2, Sparkles, ShoppingBag } from "lucide-react";

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutData: CheckoutConfirmResponse | null;
  onPaymentComplete: (result: PaymentConfirmResponse) => void;
}

export const SimulatedPaymentModal: React.FC<SimulatedPaymentModalProps> = ({
  isOpen,
  onClose,
  checkoutData,
  onPaymentComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentConfirmResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !checkoutData) return null;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await agentService.confirmPayment({
        order_id: checkoutData.order_id,
        confirmation_token: checkoutData.confirmation_token,
        provider: "mock",
      });
      setPaymentResult(res);
      onPaymentComplete(res);
    } catch (e: any) {
      setError(e?.message || "Payment simulation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Simulation Notice Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-400 block uppercase tracking-wider text-[10px]">
              Demo / Simulation Mode
            </span>
            <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">
              Live payment APIs are unconfigured. No real money will be charged.
            </p>
          </div>
        </div>

        {paymentResult ? (
          /* Payment Success State */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Order Confirmed
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Simulated Payment Succeeded!</h3>
              <p className="text-xs text-gray-500">Status: <span className="font-bold text-emerald-600">simulated_paid</span></p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-mono font-bold">{paymentResult.order_id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="font-mono font-bold text-blue-500">{paymentResult.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Paid (Demo):</span>
                <span className="font-bold">{paymentResult.currency} {paymentResult.amount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Done & Return to Workspace
            </button>
          </div>
        ) : (
          /* Order Review & Confirm Step */
          <>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Review & Confirm
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Order Checkout Summary</h3>
            </div>

            {/* Items List */}
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {checkoutData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-semibold line-clamp-1 flex-1 pr-2">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {checkoutData.currency} {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 space-y-2 text-xs border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{checkoutData.currency} {checkoutData.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Shipping:</span>
                <span>{checkoutData.shipping_amount === 0 ? "Free" : `${checkoutData.currency} ${checkoutData.shipping_amount}`}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Tax (5%):</span>
                <span>{checkoutData.currency} {checkoutData.estimated_tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total Amount:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {checkoutData.currency} {checkoutData.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Confirm Payment (Demo)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
