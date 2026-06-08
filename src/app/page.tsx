import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CrowdMeter from '@/components/CrowdMeter';
import { QrCode, Clock, Cpu, Award, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-zinc-950 to-zinc-950">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/40 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
                <Cpu className="h-3 w-3" /> Powered by AI Wait Time Prediction
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                The smart way to{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  canteen ordering
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                Ditch the long queues. Scan a QR code, browse the menu, pay online, and track your order preparation in real-time.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 shadow-lg shadow-orange-600/20 hover:scale-[1.02] transition-all"
                >
                  Order Food Now <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/qr"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-semibold px-8 py-4 border border-zinc-800 hover:border-zinc-700 hover:scale-[1.02] transition-all"
                >
                  <QrCode className="h-5 w-5 text-orange-500" /> Enter via QR Scan
                </Link>
              </div>


            </div>

            {/* Smart Crowd Detection Panel */}
            <div className="max-w-4xl mx-auto">
              <CrowdMeter />
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="border-y border-zinc-900 bg-zinc-950/50 py-16 px-4">
          <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <span className="block text-4xl sm:text-5xl font-black text-white">80%</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-500 mt-2 block">
                Queue Wait Reduction
              </span>
            </div>
            <div className="p-4">
              <span className="block text-4xl sm:text-5xl font-black text-white">300%</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-500 mt-2 block">
                Canteen Throughput
              </span>
            </div>
            <div className="p-4">
              <span className="block text-4xl sm:text-5xl font-black text-white">100%</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-500 mt-2 block">
                Digital Payment Ready
              </span>
            </div>
            <div className="p-4">
              <span className="block text-4xl sm:text-5xl font-black text-white">&lt; 90s</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-500 mt-2 block">
                Average Pickup Time
              </span>
            </div>
          </div>
        </section>

        {/* Features list */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-16">
            Everything you need for a stress-free lunch break
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 hover:border-orange-500/20 transition-all flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-600/10 border border-orange-500/25 flex items-center justify-center text-orange-500">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Scan & Order</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Scan QR codes placed on classroom desks, library cubicles, or lawns. Access the live menu instantly on your device without standing in any physical line.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 hover:border-orange-500/20 transition-all flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-600/10 border border-orange-500/25 flex items-center justify-center text-orange-500">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Live Preparation Tracking</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Watch your order progress live from Accepted → Preparing → Ready. The interface leverages server push notifications to tell you exactly when to collect.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 hover:border-orange-500/20 transition-all flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-600/10 border border-orange-500/25 flex items-center justify-center text-orange-500">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Loyalty Rewards Program</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Earn loyalty points with every transaction. Redeem accumulated points on checkout to get free beverages, meals, or combo discounts instantly.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-12 bg-zinc-950 px-4 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 font-bold text-white shadow-lg shadow-orange-600/30">
            K
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            KORE
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-400">
            Made by <span className="text-orange-400">Adhithya K</span> (24bcs403)
          </p>
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} KORE Smart Canteen. Built for College Queue Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
