'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, MapPin, CheckCircle, Smartphone } from 'lucide-react';

export default function QrClient() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDesk, setScannedDesk] = useState<string | null>(null);
  const router = useRouter();

  const handleSimulateScan = (deskNum: string) => {
    setIsScanning(true);
    setScannedDesk(null);
    
    setTimeout(() => {
      setIsScanning(false);
      setScannedDesk(deskNum);
      
      // Auto redirect to menu with desk query param after 1 second
      setTimeout(() => {
        router.push(`/menu?desk=${deskNum}`);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-500">
        <QrCode className="h-8 w-8 animate-pulse" />
      </div>

      <h1 className="text-3xl font-black tracking-tight text-white">QR Code Canteen Entry</h1>
      <p className="text-zinc-400 text-sm max-w-md mx-auto">
        Scan a QR code on any desk, table, or lawn stand across campus to access the live ordering menu instantly and set your delivery spot.
      </p>

      {/* QR scanner mock display */}
      <div className="relative mx-auto h-48 w-48 rounded-xl border border-zinc-800 bg-black/60 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-4 border border-dashed border-orange-500/30 rounded-lg" />
        
        {isScanning ? (
          <div className="space-y-2">
            <Smartphone className="h-10 w-10 mx-auto text-orange-400 animate-bounce" />
            <span className="block text-xs font-mono tracking-widest text-orange-400 uppercase animate-pulse">
              Scanning...
            </span>
          </div>
        ) : scannedDesk ? (
          <div className="space-y-2 text-emerald-400">
            <CheckCircle className="h-12 w-12 mx-auto" />
            <span className="block text-xs font-bold uppercase tracking-wider">
              Desk {scannedDesk} Registered!
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <QrCode className="h-14 w-14 mx-auto text-zinc-600" />
            <span className="block text-[10px] text-zinc-500 font-mono">
              ALIGN CAMERA FEED
            </span>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-[scan_1.5s_infinite] top-0" />
        )}
      </div>

      {/* Location simulation selection */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 text-left">
          Choose Campus Spot to Simulate Scan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Library Seating #08', code: 'LIB-08' },
            { name: 'Classroom C-104 Desk #03', code: 'C104-03' },
            { name: 'Lawn Pavilion Table #02', code: 'LAWN-02' },
            { name: 'Main Canteen Table #14', code: 'TAB-14' },
          ].map((spot) => (
            <button
              key={spot.code}
              disabled={isScanning || !!scannedDesk}
              onClick={() => handleSimulateScan(spot.code)}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-left text-xs font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50"
            >
              <span className="truncate">{spot.name}</span>
              <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-zinc-500 text-xs font-mono">
        Or, go directly to the general menu: <Link href="/menu" className="text-orange-400 hover:underline">Browse Menu</Link>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
