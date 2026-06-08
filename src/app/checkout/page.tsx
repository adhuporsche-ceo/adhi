import React from 'react';
import Navbar from '@/components/Navbar';
import CheckoutClient from '@/components/CheckoutClient';
import { getAuthedUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await getAuthedUser();

  if (!user || !user.student) {
    redirect('/login?redirect=/checkout');
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans">
      <Navbar />
      <main className="flex-1">
        <CheckoutClient
          userLoyaltyPoints={user.student.loyaltyPoints}
          userEmail={user.email}
          userName={user.name}
        />
      </main>
    </div>
  );
}
