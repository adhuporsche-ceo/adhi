'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { createCheckoutSession } from '@/app/actions/orders';
import { ShoppingBag, ArrowLeft, CreditCard, Wallet, Percent, Award, AlertCircle, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    Razorpay?: unknown;
  }
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutClientProps {
  userLoyaltyPoints: number;
  userEmail: string;
  userName: string;
}

export default function CheckoutClient({ userLoyaltyPoints, userEmail, userName }: CheckoutClientProps) {
  const [cart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = window.localStorage.getItem('kore_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('ONLINE');
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const searchParams = useSearchParams();
  const deskLocation = searchParams.get('desk');
  const router = useRouter();

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/menu');
    }
  }, [cart, router]);

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'KORE20') {
      setDiscountPercent(20);
      setErrorMessage('');
    } else if (coupon.toUpperCase() === 'FRESHERS30') {
      setDiscountPercent(30);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid coupon code.');
      setDiscountPercent(0);
    }
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const couponDiscount = (subtotal * discountPercent) / 100;
  
  // 1 loyalty point = 1 rupee discount, max 50% of discount-adjusted total
  const potentialPointsDiscount = redeemPoints ? Math.min(userLoyaltyPoints, (subtotal - couponDiscount) * 0.5) : 0;
  
  const totalAmount = Math.max(0, subtotal - couponDiscount - potentialPointsDiscount);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
    
    // Call server action to create order/checkout session
    const response = await createCheckoutSession(
      items,
      paymentMethod,
      discountPercent > 0 ? (discountPercent === 20 ? 'KORE20' : 'FRESHERS30') : undefined,
      redeemPoints
    );

    if ('error' in response && response.error) {
      setErrorMessage(response.error);
      setIsProcessing(false);
      return;
    }

    if (!('success' in response)) {
      setErrorMessage('Failed to place order.');
      setIsProcessing(false);
      return;
    }

    const { orderId, isCash } = response;

    if (isCash) {
      // Direct success for CASH payment
      localStorage.removeItem('kore_cart');
      router.push(`/orders/${orderId}/track`);
      return;
    }

    // ONLINE Payment Flow: Redirect directly to Google Pay simulator
    router.push(`/gpay-gateway?orderId=${orderId}&amount=${totalAmount}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
<Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <Link href="/menu" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm font-semibold mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Menu
      </Link>

      <h1 className="text-3xl font-black tracking-tight text-white">Order Checkout</h1>
      <p className="text-sm text-zinc-400 mt-1">
        Placing this order for <span className="font-semibold text-white">{userName}</span> ({userEmail}).
      </p>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Order Details & Payment Method */}
        <div className="md:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-zinc-800 pb-3">
              <ShoppingBag className="h-5 w-5 text-orange-500" /> Review Order Items
            </h3>
            
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="text-zinc-500 text-xs">Qty: {item.quantity} &bull; ₹{item.price} each</span>
                  </div>
                  <span className="text-zinc-300 font-semibold text-sm">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {deskLocation && (
              <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-1.5">
                📍 Delivery Location: <span className="font-bold text-white">{deskLocation}</span>
              </div>
            )}
          </div>

          {/* Payment Method Card */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
            <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">
              Select Payment Method
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Online Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-orange-500/80 bg-orange-950/10'
                    : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900'
                }`}
              >
                <CreditCard className={`h-5 w-5 mt-0.5 ${paymentMethod === 'ONLINE' ? 'text-orange-500' : 'text-zinc-500'}`} />
                <div>
                  <span className="block text-sm font-bold text-white">Online Digital Payment</span>
                  <span className="block text-xs text-zinc-500 mt-1">UPI, Cards, Netbanking via Razorpay.</span>
                </div>
              </button>

              {/* Cash Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-orange-500/80 bg-orange-950/10'
                    : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900'
                }`}
              >
                <Wallet className={`h-5 w-5 mt-0.5 ${paymentMethod === 'CASH' ? 'text-orange-500' : 'text-zinc-500'}`} />
                <div>
                  <span className="block text-sm font-bold text-white">Cash at Counter</span>
                  <span className="block text-xs text-zinc-500 mt-1">Generate token immediately, pay at canteen counter.</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing summary & Promo */}
        <div className="space-y-6">
          {/* Loyalty points card */}
          {userLoyaltyPoints > 0 && (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-orange-500" /> Redeem Loyalty Points
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                You have <span className="font-bold text-white">{userLoyaltyPoints} points</span>. Redeem them to save up to 50% on your order subtotal.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400">Apply points discount</span>
                <input
                  type="checkbox"
                  checked={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Promo Code Card */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Percent className="h-4.5 w-4.5 text-orange-500" /> Coupon Discount
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code (KORE20)"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-zinc-100 uppercase focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-zinc-700"
              >
                Apply
              </button>
            </div>
            {discountPercent > 0 && (
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                🎉 {discountPercent}% coupon discount applied!
              </div>
            )}
          </div>

          {/* Billing Card */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              Bill Summary
            </h4>

            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-zinc-200">₹{subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {potentialPointsDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Loyalty Points Discount</span>
                  <span>-₹{potentialPointsDiscount.toFixed(2)}</span>
                </div>
              )}
              {paymentMethod === 'ONLINE' && (
                <div className="flex justify-between text-zinc-500">
                  <span>Convenience Fee</span>
                  <span>₹0.00</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold text-sm text-white">
                <span>Payable Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-sm font-bold text-white py-3.5 shadow-lg shadow-orange-600/10 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Processing Order...' : 'Place Order & Pay'}
            </button>

            <div className="flex justify-center items-center gap-1.5 text-[10px] text-zinc-500 text-center font-mono">
              <ShieldCheck className="h-4.5 w-4.5 text-orange-500" />
              SECURE END-TO-END PAYMENT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
