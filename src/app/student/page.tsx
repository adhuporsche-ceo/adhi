import React from 'react';
import Navbar from '@/components/Navbar';
import { getAuthedUser } from '@/app/actions/auth';
import { getStudentOrders } from '@/app/actions/orders';
import { db } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Award, Compass, Gift, History, Bell, ExternalLink, Calendar, Receipt } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  const user = await getAuthedUser();

  if (!user || user.role !== 'STUDENT') {
    redirect('/login?redirect=/student');
  }

  const student = user.student!;
  const orders = await getStudentOrders();

  // Fetch student loyalty history
  const loyaltyPointsLogs = await db.loyaltyPoint.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Fetch unread notifications
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 8
  });

  // Loyalty levels: Bronze (< 100), Silver (100-300), Gold (300-600), Platinum (> 600)
  const pts = student.loyaltyPoints;
  let level = 'Bronze Member';
  let levelColor = 'text-amber-700 bg-amber-950/20 border-amber-900/30';
  let nextLevelPoints = 100;
  
  if (pts >= 600) {
    level = 'Platinum Tier';
    levelColor = 'text-cyan-400 bg-cyan-950/20 border-cyan-900/30';
    nextLevelPoints = 1000;
  } else if (pts >= 300) {
    level = 'Gold Tier';
    levelColor = 'text-amber-400 bg-amber-950/20 border-amber-900/30';
    nextLevelPoints = 600;
  } else if (pts >= 100) {
    level = 'Silver Tier';
    levelColor = 'text-zinc-300 bg-zinc-800/30 border-zinc-700/40';
    nextLevelPoints = 300;
  }

  const progressPercent = Math.min(100, Math.round((pts / nextLevelPoints) * 100));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">Welcome back, {user.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your loyalty rewards and view order receipts.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Loyalty & Notifications */}
          <div className="lg:col-span-1 space-y-8">
            {/* Loyalty points card */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Award className="h-5 w-5 text-orange-500" /> Canteen Loyalty Level
              </h3>

              <div className="flex justify-between items-center">
                <div>
                  <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${levelColor}`}>
                    {level}
                  </span>
                  <span className="block text-2xl font-black text-white mt-2">{pts} Points</span>
                </div>
                <Gift className="h-10 w-10 text-orange-500/20 shrink-0" />
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500 font-mono">
                  <span>Progress to Next Tier</span>
                  <span>{pts} / {nextLevelPoints} pts</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full"
                  />
                </div>
              </div>

              {/* Points log */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                  Recent Points History
                </span>
                {loyaltyPointsLogs.length > 0 ? (
                  <div className="space-y-2 font-mono text-xs">
                    {loyaltyPointsLogs.map((log) => (
                      <div key={log.id} className="flex justify-between text-zinc-400">
                        <span className="truncate max-w-[140px]">{log.reason}</span>
                        <span className={log.points > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          {log.points > 0 ? `+${log.points}` : log.points}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-600 text-xs py-2">No point logs recorded yet.</div>
                )}
              </div>
            </div>

            {/* Notifications Card */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Bell className="h-5 w-5 text-orange-500" /> Notifications Inbox
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1">
                      <h5 className="text-xs font-bold text-white flex justify-between items-center">
                        <span>{notif.title}</span>
                        <span className="text-[8px] font-mono text-zinc-600">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </h5>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-600 text-xs">
                    Your notifications inbox is currently empty.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-zinc-800 pb-3">
                <History className="h-5 w-5 text-orange-500" /> Canteen Order History
              </h3>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isActive = order.status === 'PENDING' || order.status === 'PREPARING' || order.status === 'READY';
                    
                    return (
                      <div
                        key={order.id}
                        className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-800 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">Token #{order.tokenNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              order.status === 'DELIVERED'
                                ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                                : order.status === 'CANCELLED'
                                ? 'text-red-400 bg-red-950/20 border-red-900/30'
                                : 'text-orange-400 bg-orange-950/20 border-orange-900/30 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="text-xs text-zinc-500 flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Receipt className="h-3.5 w-3.5" />
                              ₹{order.totalAmount} &bull; {order.paymentMethod}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 font-semibold truncate max-w-sm md:max-w-md">
                            Items: {order.orderItems.map(item => `${item.food.name} (x${item.quantity})`).join(', ')}
                          </p>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                          {isActive && (
                            <Link
                              href={`/orders/${order.id}/track`}
                              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white py-2 px-4 shadow-md transition-colors"
                            >
                              Track Live <Compass className="h-3.5 w-3.5 animate-spin" />
                            </Link>
                          )}
                          <Link
                            href={`/orders/${order.id}/track`}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white py-2 px-4 transition-colors"
                          >
                            Receipt <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 text-center text-zinc-600 text-sm">
                  You haven&apos;t placed any orders yet. Head to the menu to place your first smart token!
                  <div className="mt-4">
                    <Link href="/menu" className="inline-flex rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white px-4 py-2">
                      Order Food
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
