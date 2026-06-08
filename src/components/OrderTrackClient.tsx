'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, ChefHat, Bell, UtensilsCrossed, Sparkles, PhoneCall } from 'lucide-react';

interface OrderItem {
  id: string;
  food: { name: string; imageUrl: string };
  quantity: number;
  price: number;
}

interface OrderDetails {
  id: string;
  tokenNumber: number;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  estimatedWaitTime: number;
  studentId: string;
  createdAt: Date;
  orderItems: OrderItem[];
}

interface OrderTrackClientProps {
  initialOrder: OrderDetails;
}

export default function OrderTrackClient({ initialOrder }: OrderTrackClientProps) {
  const [realtimeStatus, setRealtimeStatus] = useState<string>(initialOrder.status);
  const [waitTime, setWaitTime] = useState<number>(initialOrder.estimatedWaitTime);

  // SSE subscription for real-time tracking
  useEffect(() => {
    const eventSource = new EventSource(`/api/orders/track?orderId=${initialOrder.id}`);

    eventSource.onmessage = (event) => {
      try {
        const updated = JSON.parse(event.data);
        setRealtimeStatus(updated.status);
        setWaitTime(updated.estimatedWaitTime);
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE disconnected, retrying...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [initialOrder.id]);

  const steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Received by kitchen. Waiting for approval.', icon: CheckCircle },
    { key: 'PREPARING', label: 'In the Kitchen', desc: 'Chef Rajesh is cooking your meal now.', icon: ChefHat },
    { key: 'READY', label: 'Ready for Collection', desc: 'Pick up your food from the main counter!', icon: Bell },
    { key: 'DELIVERED', label: 'Collected', desc: 'Delicious food successfully claimed.', icon: UtensilsCrossed },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'PENDING') return 0;
    if (status === 'PREPARING') return 1;
    if (status === 'READY') return 2;
    if (status === 'DELIVERED') return 3;
    return -1;
  };

  const activeIndex = getStepIndex(realtimeStatus);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Dynamic contact notification bar for 7845393337 */}
      <div className="rounded-2xl bg-orange-600/10 border border-orange-500/20 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-orange-200">
          📞 Canteen Support Helpline: Need custom prep or immediate queries? Call/WhatsApp <span className="font-bold text-white">7845393337</span>
        </div>
        <a
          href="https://wa.me/917845393337?text=Hi%2C%20I%20have%20an%20active%20order%20token%20on%20KORE%21"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-[10px] font-bold text-white py-1.5 px-3 uppercase tracking-wider"
        >
          Message Canteen <PhoneCall className="h-3 w-3" />
        </a>
      </div>

      {/* Token Banner Card */}
      <div className="rounded-2xl border border-zinc-900 bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Live Canteen Tracker
            </span>
          </div>
          <h2 className="text-3xl font-black text-white mt-1">
            Token #{initialOrder.tokenNumber}
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            Receipt ID: <span className="font-mono">{initialOrder.id.substring(0, 18)}...</span>
          </p>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-400">
          <Clock className="h-6 w-6 shrink-0" />
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              AI Wait Estimate
            </span>
            <span className="block text-lg font-black text-white">
              {realtimeStatus === 'DELIVERED' 
                ? 'Picked up' 
                : realtimeStatus === 'READY'
                ? 'Collect now!'
                : `~${waitTime} minutes`}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Digital Token QR Code for scanning */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 flex flex-col items-center text-center space-y-4">
        <div>
          <h4 className="font-bold text-white text-sm">Your Food Collection QR Token</h4>
          <p className="text-zinc-500 text-xs mt-1">Present this QR code to the delivery partner or canteen counter to scan and claim your order.</p>
        </div>

        {/* CSS Simulated QR Code */}
        <div className="relative p-4 bg-white rounded-xl shadow-inner border border-zinc-300 overflow-hidden">
          <div className="h-40 w-40 flex flex-col justify-between p-2 relative">
            <div className="absolute top-2 left-2 h-10 w-10 border-4 border-black bg-white flex items-center justify-center">
              <div className="h-4 w-4 bg-black" />
            </div>
            <div className="absolute top-2 right-2 h-10 w-10 border-4 border-black bg-white flex items-center justify-center">
              <div className="h-4 w-4 bg-black" />
            </div>
            <div className="absolute bottom-2 left-2 h-10 w-10 border-4 border-black bg-white flex items-center justify-center">
              <div className="h-4 w-4 bg-black" />
            </div>

            <div className="w-24 h-24 flex flex-wrap gap-1 p-1 opacity-70 mt-12 ml-12">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-sm ${
                    (i * 7 + 13) % 4 === 0 || (i * 3) % 5 === 0 ? 'bg-black' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Laser Scan line */}
          <div className="absolute inset-x-0 h-0.5 bg-orange-500 animate-[qrscan_2.5s_infinite] shadow-lg shadow-orange-500 top-0" />
        </div>

        <div className="text-[10px] text-zinc-500 font-mono uppercase">
          TICKET-UUID: {initialOrder.id}
        </div>
      </div>

      {/* Live Timeline Stepper */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-8">
        <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" /> Order Status Timeline
        </h3>

        <div className="relative pl-8 space-y-8 before:absolute before:inset-y-1 before:left-3 before:w-0.5 before:bg-zinc-800">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isPast = idx < activeIndex;
            const isActive = idx === activeIndex;

            let iconColor = 'text-zinc-600 bg-zinc-950 border-zinc-800';
            let textColor = 'text-zinc-500';

            if (isPast) {
              iconColor = 'text-emerald-500 bg-emerald-950/20 border-emerald-500/30';
              textColor = 'text-zinc-300';
            } else if (isActive) {
              iconColor = 'text-orange-500 bg-orange-950/20 border-orange-500/40 scale-110 shadow-lg shadow-orange-500/10';
              textColor = 'text-white';
            }

            return (
              <div key={step.key} className="relative flex gap-4 items-start group">
                <div className={`absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${iconColor} z-10`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div>
                  <h4 className={`text-sm font-bold tracking-tight ${textColor} flex items-center gap-2`}>
                    {step.label}
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Receipt Details */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
          Items Ordered
        </h3>
        <div className="space-y-3">
          {initialOrder.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-1 text-sm">
              <span className="text-zinc-300">
                {item.food.name} <span className="text-zinc-600 font-mono">x{item.quantity}</span>
              </span>
              <span className="text-zinc-400 font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-white text-base">
            <span>Total Paid</span>
            <span>₹{initialOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-2 text-zinc-500 text-xs flex justify-between font-mono">
          <span>Payment: {initialOrder.paymentMethod}</span>
          <span>Status: {initialOrder.paymentStatus}</span>
        </div>
      </div>

      <div className="text-center">
        <Link href="/student" className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold text-zinc-300 hover:text-white px-6 py-3 border border-zinc-800 transition-all">
          Go to Student Dashboard
        </Link>
      </div>
    </div>
  );
}
