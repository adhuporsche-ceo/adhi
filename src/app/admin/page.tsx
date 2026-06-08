import React from 'react';
import Navbar from '@/components/Navbar';
import AdminClient from '@/components/AdminClient';
import { getAuthedUser } from '@/app/actions/auth';
import { getAdminStats, getKitchenQueue } from '@/app/actions/orders';
import { getFoods, getCategories } from '@/app/actions/menu';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getAuthedUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login?redirect=/admin');
  }

  const [stats, foods, categories, activeOrders] = await Promise.all([
    getAdminStats(),
    getFoods(),
    getCategories(),
    getKitchenQueue(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <Navbar />
      <main className="flex-1">
        <AdminClient
          stats={stats}
          foods={foods}
          categories={categories}
          activeOrders={activeOrders}
        />
      </main>
    </div>
  );
}
