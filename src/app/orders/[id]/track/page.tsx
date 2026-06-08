import React from 'react';
import Navbar from '@/components/Navbar';
import OrderTrackClient from '@/components/OrderTrackClient';
import { getOrderDetails } from '@/app/actions/orders';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrderTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-red-500">Order not found.</h2>
          <Link href="/menu" className="mt-4 text-orange-500 underline text-sm">
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-50">
      <Navbar />
      <main className="flex-1 flex flex-col justify-start items-center">
        <OrderTrackClient
          initialOrder={order}
        />
      </main>
    </div>
  );
}
