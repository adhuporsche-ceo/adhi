'use client';

import React, { useEffect, useRef, useState } from 'react';
import { simulateCctvAnalysis } from '@/lib/ai';
import { Camera, Users, RefreshCw, AlertCircle } from 'lucide-react';

export default function CrowdMeter() {
  const [scanSeed, setScanSeed] = useState(0.4);
  const [data, setData] = useState(() => simulateCctvAnalysis(0.4));
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const nextSeed = Math.random();
      setScanSeed(nextSeed);
      setData(simulateCctvAnalysis(nextSeed));
      setIsScanning(false);
    }, 1200);
  };

  // Continuous minor fluctuations to make the camera stream look "alive"
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isScanning) {
        setData(() => {
          const noise = (Math.random() - 0.5) * 0.1;
          const newSeed = Math.max(0.1, Math.min(0.9, scanSeed + noise));
          return simulateCctvAnalysis(newSeed);
        });
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [scanSeed, isScanning]);

  // Draw the simulated CCTV frame on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dark blueprints grid to simulate a radar / camera view
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Canteen zones outline (Counter, Tables, Entrance)
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 40, 200, 380); // Seating Area A
    ctx.strokeRect(410, 40, 200, 380); // Queue Zone B
    
    ctx.fillStyle = 'rgba(249, 115, 22, 0.05)';
    ctx.fillRect(410, 40, 200, 380);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(249, 115, 22, 0.6)';
    ctx.fillText('ZONE A: SEATING', 40, 60);
    ctx.fillText('ZONE B: WAITING QUEUE', 420, 60);

    // Draw detected students
    data.detections.forEach((person, idx) => {
      // Glow effect around detections
      ctx.shadowBlur = 10;
      ctx.shadowColor = data.congestion === 'HIGH' ? '#ef4444' : data.congestion === 'MEDIUM' ? '#eab308' : '#22c55e';

      // Draw bounding box
      ctx.strokeStyle = data.congestion === 'HIGH' ? 'rgba(239, 68, 68, 0.8)' : data.congestion === 'MEDIUM' ? 'rgba(234, 179, 8, 0.8)' : 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(person.x - 12, person.y - 12, 24, 24);

      // Draw center dot
      ctx.fillStyle = data.congestion === 'HIGH' ? '#ef4444' : data.congestion === 'MEDIUM' ? '#eab308' : '#22c55e';
      ctx.beginPath();
      ctx.arc(person.x, person.y, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw ID label
      ctx.font = '8px monospace';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(`P-${100 + idx}`, person.x - 12, person.y - 16);
    });

    // Draw scan line moving up and down if scanning
    if (isScanning) {
      const time = Date.now() / 150;
      const scanY = (Math.sin(time) * 0.5 + 0.5) * canvas.height;
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f97316';
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Camera overlays (Rec icon, bounds)
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    // Corners
    ctx.beginPath(); ctx.moveTo(15, 30); ctx.lineTo(15, 15); ctx.lineTo(30, 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width - 15, 30); ctx.lineTo(canvas.width - 15, 15); ctx.lineTo(canvas.width - 30, 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, canvas.height - 30); ctx.lineTo(15, canvas.height - 15); ctx.lineTo(30, canvas.height - 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width - 15, canvas.height - 30); ctx.lineTo(canvas.width - 15, canvas.height - 15); ctx.lineTo(canvas.width - 30, canvas.height - 15); ctx.stroke();

    // Red rec dot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(canvas.width - 30, 35, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#f4f4f5';
    ctx.fillText('LIVE CCTV-01 FEED', 25, 35);
    ctx.fillText('REC', canvas.width - 60, 38);

  }, [data, isScanning]);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Visual Canvas feed */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black w-full max-w-[480px]">
          <canvas
            ref={canvasRef}
            width={480}
            height={320}
            className="w-full h-auto block aspect-[3/2]"
          />
          {isScanning && (
            <div className="absolute inset-0 bg-orange-600/5 flex items-center justify-center pointer-events-none">
              <span className="bg-zinc-950/90 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest animate-pulse">
                Analyzing crowd density...
              </span>
            </div>
          )}
        </div>

        {/* Diagnostic Panel */}
        <div className="flex-1 w-full flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Camera className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">AI Crowd Detection Engine</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white mb-4">
              Canteen Live Congestion Status
            </h3>

            {/* Meters */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-4 flex flex-col justify-center">
                <span className="text-zinc-500 text-xs font-medium">Head Count</span>
                <span className="text-3xl font-black text-white flex items-center gap-1.5 mt-1">
                  <Users className="h-6 w-6 text-zinc-400" />
                  {data.count}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-4 flex flex-col justify-center">
                <span className="text-zinc-500 text-xs font-medium">Congestion Index</span>
                <span className={`text-2xl font-black mt-1 uppercase ${
                  data.congestion === 'HIGH' ? 'text-red-500' : data.congestion === 'MEDIUM' ? 'text-yellow-500' : 'text-emerald-500'
                }`}>
                  {data.congestion}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-950/20 border border-orange-900/30 text-orange-200 text-sm mb-6">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Canteen Advisory: </span>
                {data.congestion === 'HIGH' 
                  ? 'High crowd level detected in Zone B waiting queue. Place order now to skip queue later, or wait 15 minutes.'
                  : data.congestion === 'MEDIUM'
                  ? 'Moderate traffic. Normal preparation times are running. You can proceed to order.'
                  : 'Canteen queue is empty! Order now for immediate preparation.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white font-semibold py-3 px-4 border border-zinc-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning feeds...' : 'Recalibrate CCTV Analytics'}
          </button>
        </div>
      </div>
    </div>
  );
}
