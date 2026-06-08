import React from 'react';
import Navbar from '@/components/Navbar';
import QrClient from '@/components/QrClient';

export const dynamic = 'force-dynamic';

export default function QrPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <QrClient />
      </main>
    </div>
  );
}
