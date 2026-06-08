import React from 'react';
import Navbar from '@/components/Navbar';
import { getAuthedUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { Check, Crown, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const user = await getAuthedUser();
  let userSubscription = null;

  if (user && user.student) {
    userSubscription = await prisma.subscription.findFirst({
      where: {
        studentId: user.student.id,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  const plans = [
    {
      id: 'basic',
      name: 'Basic Meal Plan',
      price: 1999,
      duration: 'Monthly',
      features: ['2 Meals per day', 'Standard menu access', 'No priority queueing'],
      color: 'zinc',
    },
    {
      id: 'premium',
      name: 'Premium Pass',
      price: 3499,
      duration: 'Monthly',
      features: ['Unlimited daily meals', 'Premium menu access', 'Skip the line priority', 'Free weekend specials'],
      color: 'orange',
      popular: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Meal Subscriptions</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Subscribe to a meal plan to save money and enjoy seamless dining at the campus canteen without worrying about daily payments.
          </p>
        </div>

        {userSubscription && (
          <div className="mb-12 bg-emerald-950/20 border border-emerald-900/30 rounded-3xl p-6 text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-emerald-400 mb-2 flex justify-center items-center gap-2">
              <Crown className="h-5 w-5" /> Active Subscription
            </h3>
            <p className="text-zinc-300">
              You are currently subscribed to the <strong className="text-white">{userSubscription.planName}</strong>. 
              Valid until <strong className="text-white">{new Date(userSubscription.endDate).toLocaleDateString()}</strong>.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-3xl border p-8 flex flex-col ${
                plan.popular 
                  ? 'border-orange-500/50 bg-orange-950/10 shadow-[0_0_40px_rgba(249,115,22,0.1)] scale-105 z-10' 
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-orange-400' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">₹{plan.price}</span>
                  <span className="text-zinc-500 font-medium">/{plan.duration.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`rounded-full p-1 ${plan.popular ? 'bg-orange-500/20' : 'bg-zinc-800'}`}>
                      <Check className={`h-4 w-4 ${plan.popular ? 'text-orange-500' : 'text-zinc-400'}`} />
                    </div>
                    <span className="text-zinc-300 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
                plan.popular 
                  ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-white text-zinc-900 hover:bg-zinc-100'
              }`}>
                Subscribe Now
              </button>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-12 text-center text-sm text-zinc-500 flex justify-center items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Please log in as a student to purchase a subscription.
          </div>
        )}
      </main>
    </div>
  );
}
