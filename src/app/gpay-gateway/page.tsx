'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completePaymentAction } from '@/app/actions/orders';
import { AlertCircle, ShieldCheck, Smartphone } from 'lucide-react';

export default function GPayGatewayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const rawAmount = searchParams.get('amount');
  const amount = rawAmount ? parseFloat(rawAmount) + 1.0 : 0;
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!orderId) {
      setError('Invalid Order ID');
      return;
    }

    setIsPaying(true);
    setError('');

    // Simulate network latency
    setTimeout(async () => {
      const result = await completePaymentAction(
        orderId!,
        `gpay_tx_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        'SUCCESS'
      );

      if (result.success) {
        // Clear local storage cart
        localStorage.removeItem('kore_cart');
        // Redirect back to track page
        router.push(`/orders/${orderId}/track`);
      } else {
        setError(result.error || 'GPay gateway failed to verify transaction.');
        setIsPaying(false);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 font-sans text-zinc-900">
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl space-y-6">
        
        {/* Google Pay Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-1.5">
            {/* Google Pay Logo Dots */}
            <span className="h-4 w-4 rounded-full bg-blue-500" />
            <span className="h-4 w-4 rounded-full bg-red-500" />
            <span className="h-4 w-4 rounded-full bg-yellow-500" />
            <span className="h-4 w-4 rounded-full bg-green-500" />
            <span className="text-lg font-bold tracking-tight text-zinc-700 ml-1">
              Google Pay
            </span>
          </div>
          <span className="text-[10px] bg-zinc-100 border border-zinc-200 rounded px-2 py-0.5 text-zinc-500 font-mono font-bold">
            SECURE
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Summary */}
        <div className="text-center py-6 space-y-2">
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Paying KORE Smart Canteen</span>
          <div className="text-5xl font-black tracking-tight text-zinc-900">
            ₹{amount.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400 block font-mono">
            Transaction ID: {orderId?.substring(0, 10).toUpperCase()}
          </span>
        </div>

        {/* Credit Card / Bank Selector (mock) */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-200 border border-zinc-300 flex items-center justify-center font-bold text-zinc-600">
              SBI
            </div>
            <div>
              <span className="block font-bold text-zinc-800">State Bank of India</span>
              <span className="block text-xs text-zinc-400">Savings Account &bull;&bull;&bull;&bull; 4892</span>
            </div>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <a
            href={`upi://pay?pa=merchant@upi&pn=KORE%20Canteen&am=${amount.toFixed(2)}&tr=${orderId}&cu=INR`}
            className="w-full py-4 rounded-2xl text-base font-bold text-zinc-900 bg-white border-2 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Smartphone className="h-5 w-5 text-zinc-600" />
            Open GPay App Directly
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-400">
              <span className="bg-white px-2">OR</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="w-full py-4 rounded-2xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPaying ? (
              <span className="animate-pulse">Authorizing GPay PIN...</span>
            ) : (
              `Proceed in Browser ₹${amount.toFixed(2)}`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 text-center font-mono">
          <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
          PCI-DSS COMPLIANT ENCRYPTION
        </div>

      </div>
    </div>
  );
}
