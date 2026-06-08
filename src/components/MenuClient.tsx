'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Clock, Award, Star, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  preparationTime: number;
  isAvailable: boolean;
  categoryId: string;
  rating: number;
  category: { name: string };
}

interface CartItem extends FoodItem {
  quantity: number;
}

interface MenuClientProps {
  initialFoods: FoodItem[];
  categories: { id: string; name: string }[];
  recommendations: FoodItem[];
  activeOrdersCount: number;
  userLocation?: string;
  userLoyaltyPoints?: number;
}

export default function MenuClient({
  initialFoods,
  categories,
  recommendations,
  activeOrdersCount,
  userLocation,
  userLoyaltyPoints
}: MenuClientProps) {
  const [foods] = useState(initialFoods);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = window.localStorage.getItem('kore_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [deskLocation, setDeskLocation] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('desk');
  });

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('kore_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (food: FoodItem) => {
    const existing = cart.find(item => item.id === food.id);
    if (existing) {
      saveCart(cart.map(item => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      saveCart([...cart, { ...food, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (foodId: string, delta: number) => {
    const existing = cart.find(item => item.id === foodId);
    if (!existing) return;

    const newQuantity = existing.quantity + delta;
    if (newQuantity <= 0) {
      saveCart(cart.filter(item => item.id !== foodId));
    } else {
      saveCart(cart.map(item => item.id === foodId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  // Filter foods locally for instant response
  const filteredFoods = foods.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.categoryId === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase()) || 
                          food.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  // AI wait time helper
  const getAiWaitTime = (baseTime: number) => {
    // Dynamic wait = base + (active orders * 1.2) minutes
    return Math.ceil(baseTime + (activeOrdersCount * 1.2));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 items-start">
      {/* Menu Area */}
      <div className="flex-1 w-full space-y-8">
        {/* Banner with Seat registration indicator */}
        {deskLocation && (
          <div className="rounded-2xl bg-orange-950/20 border border-orange-500/20 px-6 py-4 flex items-center justify-between">
            <div className="text-sm">
              📍 Registered Order Spot: <span className="font-bold text-orange-400">{deskLocation}</span>
            </div>
            <button
              onClick={() => {
                setDeskLocation(null);
                const url = new URL(window.location.href);
                url.searchParams.delete('desk');
                window.history.pushState({}, '', url.toString());
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Clear spot
            </button>
          </div>
        )}

        {/* AI Recommendations */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold tracking-tight text-white">Recommended for You</h2>
            <span className="text-[10px] bg-orange-600/10 border border-orange-500/20 px-1.5 py-0.5 rounded text-orange-400 uppercase font-black tracking-wider animate-pulse ml-2">
              AI Powered
            </span>
            {userLocation && (
              <span className="text-[10px] bg-zinc-900/90 border border-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
                Delivery spot: {userLocation}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((food) => (
              <div
                key={food.id}
                className="flex gap-4 p-4 rounded-2xl border border-zinc-900 bg-zinc-900/30 hover:border-orange-500/20 transition-all items-center relative overflow-hidden group"
              >
                {/* Visual badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950/90 text-amber-400 text-[10px] font-bold">
                  <Star className="h-3 w-3 fill-amber-400" /> {food.rating}
                </div>

                <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={food.imageUrl}
                    alt={food.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider block">
                    Trending
                  </span>
                  <h4 className="font-bold text-white text-sm truncate">{food.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                    <span className="font-bold text-white">₹{food.price}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      {getAiWaitTime(food.preparationTime)} mins
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(food)}
                    className="mt-2 text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 border border-orange-500/20 hover:bg-orange-500/10 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Quick Add <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-16 z-30 bg-zinc-950 py-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute inset-y-0 left-3 h-5 w-5 my-auto text-zinc-500" />
            <input
              type="text"
              placeholder="Search food items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-900 bg-zinc-900/40 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Categories Horizontal */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <div
                key={food.id}
                className="rounded-2xl border border-zinc-900 bg-zinc-900/20 overflow-hidden flex flex-col justify-between hover:border-orange-500/20 transition-all group hover:scale-[1.01]"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                    <Image
                      src={food.imageUrl}
                      alt={food.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/80 backdrop-blur-sm text-amber-400 text-xs font-bold border border-zinc-800/80">
                      <Star className="h-3 w-3 fill-amber-400" /> {food.rating}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                      {food.category.name}
                    </span>
                    <h3 className="font-bold text-white tracking-tight">{food.name}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-zinc-900/80 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Price</span>
                    <span className="font-black text-white text-lg">₹{food.price}</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> wait time
                    </span>
                    <span className="text-xs font-bold text-orange-400">
                      ~{getAiWaitTime(food.preparationTime)} mins
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => handleAddToCart(food)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-orange-600 text-sm font-semibold text-zinc-300 hover:text-white py-2.5 transition-colors border border-zinc-800 hover:border-transparent"
                  >
                    Add to Cart <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-zinc-500">
              No matching items found. Try searching for something else!
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar Panel */}
      <div className="w-full lg:w-80 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md sticky top-24 self-start space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <span>Shopping Cart</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="space-y-4">
            {/* Cart list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-2 py-1">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                    <span className="text-[10px] text-zinc-500">₹{item.price} each</span>
                  </div>
                  <div className="flex items-center gap-2.5 border border-zinc-800 rounded-lg p-1 bg-zinc-950/60 shrink-0">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="p-1 hover:text-orange-400 text-zinc-500 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold text-zinc-200">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="p-1 hover:text-orange-400 text-zinc-500 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Loyalty points banner */}
            {userLoyaltyPoints !== undefined && userLoyaltyPoints > 0 && (
              <div className="rounded-xl bg-orange-950/20 border border-orange-900/30 p-3 text-xs text-orange-200 flex items-start gap-2">
                <Award className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Loyalty Rewards:</span> You have <span className="font-bold text-white">{userLoyaltyPoints} points</span> available to redeem at checkout!
                </div>
              </div>
            )}

            {/* Calculations */}
            <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-semibold">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800/50 pt-2 font-bold text-white text-base">
                <span>Order Total</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            <Link
              href={deskLocation ? `/checkout?desk=${deskLocation}` : '/checkout'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-sm font-bold text-white py-3.5 shadow-lg shadow-orange-600/10 hover:scale-[1.01] transition-all"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500 text-sm">
            Your cart is empty. Add some delicious items to get started!
          </div>
        )}
      </div>
    </div>
  );
}
