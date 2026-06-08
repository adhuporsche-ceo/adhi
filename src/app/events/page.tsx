import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { Calendar, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: 'asc' },
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Campus Events</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Stay updated with the latest happenings, food festivals, and student events around the campus.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 bg-zinc-900/20 rounded-3xl border border-zinc-800">
            <Calendar className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
            <p className="text-lg">No upcoming events scheduled at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
                <div className="h-48 bg-zinc-800 w-full relative">
                  {event.imageUrl ? (
                    <Image src={event.imageUrl} alt={event.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <Calendar className="h-10 w-10 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-zinc-900/90 backdrop-blur text-orange-400 font-bold px-3 py-1.5 rounded-xl text-sm border border-orange-500/20">
                    {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-sm text-zinc-400 mb-6 flex-1 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mt-auto pt-4 border-t border-zinc-800/50 text-xs font-medium text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      {new Date(event.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
