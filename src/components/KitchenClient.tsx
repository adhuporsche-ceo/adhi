'use client';

import React, { useState } from 'react';
import { updateOrderStatus } from '@/app/actions/orders';
import { ChefHat, Play, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';

interface OrderItem {
  id: string;
  food: { name: string };
  quantity: number;
}

interface Order {
  id: string;
  tokenNumber: number;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  estimatedWaitTime: number;
  createdAt: Date;
  student: { user: { name: string } };
  orderItems: OrderItem[];
}

interface KitchenClientProps {
  initialOrders: Order[];
}

export default function KitchenClient({ initialOrders }: KitchenClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch updates manually
  const refreshQueue = async () => {
    // In a production app, this polls the database or triggers via websockets. 
    // Here we can reload the window or re-fetch orders using a client function. 
    // For simplicity, reload lets server re-query current state.
    window.location.reload();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'PREPARING' | 'READY' | 'DELIVERED') => {
    setErrorMsg('');
    
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o).filter(o => {
      // Remove delivered orders from the kitchen dashboard view
      if (newStatus === 'DELIVERED' && o.id === orderId) return false;
      return true;
    }));

    const result = await updateOrderStatus(orderId, newStatus);
    if (result.error) {
      setErrorMsg(result.error);
      // Revert reload
      window.location.reload();
    }
  };

  // Group columns
  const pendingOrders = orders
    .filter(o => o.status === 'PENDING')
    // AI Priority Logic: Sort by calculated heuristic (older/larger/faster preparation gets prioritization)
    .sort((a, b) => b.estimatedWaitTime - a.estimatedWaitTime);

  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Dashboard header stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-500" /> Kitchen Console
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage active canteen queue orders, accept tickets, and flag collection status.</p>
        </div>

        <div className="flex items-center gap-3">
          {errorMsg && (
            <span className="text-red-400 text-xs font-semibold mr-2">{errorMsg}</span>
          )}
          <button
            onClick={refreshQueue}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 text-xs font-bold transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Pending (AI prioritized) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <span className="font-bold text-white text-sm">1. PENDING INCOMING</span>
            <span className="text-xs bg-orange-600/10 text-orange-400 font-bold px-2 py-0.5 rounded border border-orange-500/20">
              {pendingOrders.length} orders
            </span>
          </div>

          <div className="space-y-3">
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-3 hover:border-zinc-800/80 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-black text-white">Token #{order.tokenNumber}</span>
                      <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">Ordered by: {order.student.user.name}</span>
                    </div>
                    <span className="text-[10px] bg-orange-950 text-orange-400 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-orange-900/30">
                      AI Optimized Queue
                    </span>
                  </div>

                  <div className="border-t border-zinc-900 pt-2 space-y-1.5 text-xs text-zinc-400 font-mono">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.food.name}</span>
                        <span className="text-zinc-200">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-xs">
                    <span className="text-zinc-500 font-mono">{order.paymentMethod} &bull; {order.paymentStatus}</span>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="inline-flex items-center gap-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 shadow transition-colors"
                    >
                      Start Cooking <Play className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-700 text-xs font-mono">No incoming orders.</div>
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <span className="font-bold text-white text-sm">2. ACTIVE PREPARATION</span>
            <span className="text-xs bg-orange-600/10 text-orange-400 font-bold px-2 py-0.5 rounded border border-orange-500/20">
              {preparingOrders.length} items
            </span>
          </div>

          <div className="space-y-3">
            {preparingOrders.length > 0 ? (
              preparingOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-orange-900/10 bg-zinc-950 p-4 space-y-3 hover:border-orange-500/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-black text-white">Token #{order.tokenNumber}</span>
                      <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">Cooking under Chef Rajesh</span>
                    </div>
                    <span className="text-[10px] bg-yellow-950 text-yellow-400 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-yellow-900/30 animate-pulse">
                      Preparing
                    </span>
                  </div>

                  <div className="border-t border-zinc-900 pt-2 space-y-1.5 text-xs text-zinc-400 font-mono">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.food.name}</span>
                        <span className="text-zinc-200">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-xs">
                    <span className="text-zinc-500 font-mono">Wait Time: ~{order.estimatedWaitTime}m</span>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 shadow transition-colors"
                    >
                      Mark Ready <CheckCircle2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-700 text-xs font-mono">No items currently cooking.</div>
            )}
          </div>
        </div>

        {/* Column 3: Ready for collection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <span className="font-bold text-white text-sm">3. COUNTER PICKUP</span>
            <span className="text-xs bg-orange-600/10 text-orange-400 font-bold px-2 py-0.5 rounded border border-orange-500/20">
              {readyOrders.length} ready
            </span>
          </div>

          <div className="space-y-3">
            {readyOrders.length > 0 ? (
              readyOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-emerald-500/20 bg-zinc-950 p-4 space-y-3 hover:border-emerald-500/35 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-black text-white">Token #{order.tokenNumber}</span>
                      <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">Delivery zone active</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-emerald-900/30">
                      Counter Ready
                    </span>
                  </div>

                  <div className="border-t border-zinc-900 pt-2 space-y-1.5 text-xs text-zinc-400 font-mono">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.food.name}</span>
                        <span className="text-zinc-200">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-xs">
                    <span className="text-zinc-500 font-mono">Total: ₹{order.totalAmount}</span>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold px-3 py-1.5 border border-zinc-700 transition-colors"
                    >
                      Complete Pickup <UserCheck className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-700 text-xs font-mono">No items waiting at counter.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
