import React from 'react';
import Navbar from '@/components/Navbar';
import KitchenClient from '@/components/KitchenClient';
import { getAuthedUser } from '@/app/actions/auth';
import { getKitchenQueue } from '@/app/actions/orders';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function KitchenPage() {
  const user = await getAuthedUser();

  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    redirect('/login?redirect=/kitchen');
  }

  const queue = await getKitchenQueue();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <Navbar />
      <main className="flex-1">
        <KitchenClient
          initialOrders={queue}
        />
      </main>
    </div>
  );
}
