'use client';

import React, { useState } from 'react';
import { addFoodAction, updateFoodAvailabilityAction } from '@/app/actions/menu';
import { updateOrderStatus } from '@/app/actions/orders';
import CrowdMeter from '@/components/CrowdMeter';
import { BarChart3, ToggleLeft, ToggleRight, Plus, AlertCircle, Package } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  category: { name: string };
}

interface OrderItemDetail {
  id: string;
  quantity: number;
  food: { name: string };
}

interface ActiveOrder {
  id: string;
  tokenNumber: number;
  status: string;
  student: { user: { name: string } };
  orderItems: OrderItemDetail[];
}

interface AdminClientProps {
  stats: {
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    revenue: number;
    convenienceRevenue: number;
    recentOrders: Array<{ id: string; tokenNumber: number; student: { user: { name: string } } }>;
  } | null;
  foods: FoodItem[];
  categories: Array<{ id: string; name: string }>;
  activeOrders: ActiveOrder[];
}

export default function AdminClient({ stats, foods, categories, activeOrders: initialOrders }: AdminClientProps) {
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [menuItems, setMenuItems] = useState(foods);
  const [orders, setOrders] = useState(initialOrders || []);

  const handleToggleAvailability = async (foodId: string, currentStatus: boolean) => {
    // Optimistic toggle
    setMenuItems(prev => prev.map(f => f.id === foodId ? { ...f, isAvailable: !currentStatus } : f));
    await updateFoodAvailabilityAction(foodId, !currentStatus);
  };

  const handleAddFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const formData = new FormData(e.currentTarget);
    const result = await addFoodAction(formData);

    if (result.error) {
      setFormError(result.error);
    } else {
      setFormSuccess('Food item added successfully!');
      e.currentTarget.reset();
      // Reload page to refresh list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'PREPARING' | 'READY' | 'DELIVERED') => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    await updateOrderStatus(orderId, status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-orange-500" /> Admin Command Center
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Monitor canteen analytics, manage live menu listings, and review crowd CCTV streams.</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-5">
            <span className="text-zinc-500 text-xs font-semibold block uppercase tracking-wider">Gross Canteen Revenue</span>
            <span className="text-3xl font-black text-white block mt-2 flex items-center text-orange-400">
              ₹{stats.revenue.toFixed(2)}
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-5">
            <span className="text-zinc-500 text-xs font-semibold block uppercase tracking-wider">Convenience Fees Collected</span>
            <span className="text-3xl font-black text-white block mt-2 flex items-center text-emerald-400">
              ₹{stats.convenienceRevenue.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1">₹1 silent transaction charges</span>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-5">
            <span className="text-zinc-500 text-xs font-semibold block uppercase tracking-wider">Total Token Bookings</span>
            <span className="text-3xl font-black text-white block mt-2">{stats.totalOrders}</span>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-5">
            <span className="text-zinc-500 text-xs font-semibold block uppercase tracking-wider">Kitchen Queue Load</span>
            <span className="text-3xl font-black text-white block mt-2">{stats.pendingOrders} active</span>
          </div>
        </div>
      )}

      {/* CCTV & Live Feeds */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg border-b border-zinc-900 pb-2">
          CCTV Camera & Crowd Analysis
        </h3>
        <CrowdMeter />
      </div>

      {/* Live Order Tracking Updates */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg border-b border-zinc-900 pb-2 flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" /> Live Order Tracking & Dispatch
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-bold">Token #{order.tokenNumber}</h4>
                  <p className="text-zinc-400 text-xs">{order.student.user.name}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                  order.status === 'PENDING' ? 'bg-zinc-800 text-zinc-300' :
                  order.status === 'PREPARING' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {order.status}
                </div>
              </div>
              <div className="space-y-1">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="text-sm text-zinc-300 flex justify-between">
                    <span>{item.quantity}x {item.food.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-zinc-800/50 flex gap-2">
                {order.status === 'PENDING' && (
                  <button 
                    onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button 
                    onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
                  >
                    Mark as Ready
                  </button>
                )}
                {order.status === 'READY' && (
                  <button 
                    onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors border border-zinc-700"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="col-span-full py-8 text-center text-zinc-500 text-sm">
              No active orders in the queue.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Menu Management */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-white text-lg border-b border-zinc-900 pb-2">
            Active Menu Items & Status
          </h3>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 overflow-hidden divide-y divide-zinc-900">
            {menuItems.map((food) => (
              <div key={food.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">{food.name}</h4>
                  <span className="text-zinc-500 text-xs font-mono">{food.category.name} &bull; ₹{food.price}</span>
                </div>

                <button
                  onClick={() => handleToggleAvailability(food.id, food.isAvailable)}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  {food.isAvailable ? (
                    <>
                      <span className="text-emerald-400 font-medium">Available</span>
                      <ToggleRight className="h-6 w-6 text-emerald-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-red-400 font-medium">Unavailable</span>
                      <ToggleLeft className="h-6 w-6 text-zinc-600" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Add Food Item Form */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
          <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-500" /> Add New Food Item
          </h3>

          <form onSubmit={handleAddFood} className="space-y-4 text-sm">
            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-950/20 border border-red-900/30 p-3 text-red-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 p-3 text-emerald-400 text-xs">
                <span>{formSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Food Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Spicy Veg Wrap"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Description</label>
              <textarea
                name="description"
                required
                placeholder="Tortilla wrap stuffed with potatoes, cheese, and spicy schezwan sauce."
                className="w-full h-20 rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-700 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="90"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Prep Time (mins)</label>
                <input
                  name="preparationTime"
                  type="number"
                  required
                  placeholder="8"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Category</label>
              <select
                name="categoryId"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-300 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Image URL (Optional)</label>
              <input
                name="imageUrl"
                type="text"
                placeholder="https://example.com/food.jpg"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-700 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-orange-600 hover:bg-orange-500 py-3 text-white font-bold transition-colors"
            >
              Save Menu Item
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
