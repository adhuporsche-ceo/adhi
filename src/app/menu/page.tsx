import React from 'react';
import Navbar from '@/components/Navbar';
import MenuClient from '@/components/MenuClient';
import { getFoods, getCategories, getRecommendationsAction } from '@/app/actions/menu';
import { getAuthedUser } from '@/app/actions/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const [foods, categories, recommendations, user] = await Promise.all([
    getFoods(),
    getCategories(),
    getRecommendationsAction(),
    getAuthedUser(),
  ]);

  // Fetch active order count for wait times
  const activeOrdersCount = await db.order.count({
    where: {
      status: { in: ['PENDING', 'PREPARING'] }
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <Navbar />
      <main className="flex-1">
        <MenuClient
          initialFoods={foods}
          categories={categories}
          recommendations={recommendations}
          activeOrdersCount={activeOrdersCount}
          userLoyaltyPoints={user?.student?.loyaltyPoints || 0}
        />
      </main>
    </div>
  );
}
