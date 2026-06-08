'use client';

import { useEffect, useState, useCallback } from 'react';

export default function KeyWatermark() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  const showWatermark = useCallback(() => {
    setVisible(true);
    setAnimating(true);
    const hideTimer = setTimeout(() => {
      setAnimating(false);
      const removeTimer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(removeTimer);
    }, 3000);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if the user is typing inside an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        if (cleanup) cleanup();
        cleanup = showWatermark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cleanup) cleanup();
    };
  }, [showWatermark]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"
      aria-live="polite"
      aria-label="Developer watermark"
    >
      {/* Backdrop blur */}
      <div
        className={`absolute inset-0 bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Card */}
      <div
        className={`relative flex flex-col items-center gap-3 rounded-3xl bg-white px-12 py-8 shadow-2xl ring-1 ring-gray-100 transition-all duration-300 ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2'
        }`}
        style={{ transform: animating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)' }}
      >
        {/* Google colour dots */}
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full shadow-sm"
            style={{ backgroundColor: '#4285F4' }}
          />
          <span
            className="h-4 w-4 rounded-full shadow-sm"
            style={{ backgroundColor: '#EA4335' }}
          />
          <span
            className="h-4 w-4 rounded-full shadow-sm"
            style={{ backgroundColor: '#FBBC05' }}
          />
          <span
            className="h-4 w-4 rounded-full shadow-sm"
            style={{ backgroundColor: '#34A853' }}
          />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Name */}
        <div className="text-center">
          <p className="text-2xl font-black tracking-tight text-gray-800">
            Adhithya K
          </p>
          <p
            className="mt-1 font-mono text-sm font-bold tracking-[0.25em] uppercase"
            style={{ color: '#4285F4' }}
          >
            24BCS403
          </p>
        </div>

        {/* Label */}
        <div
          className="rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white"
          style={{ backgroundColor: '#34A853' }}
        >
          Developer
        </div>
      </div>
    </div>
  );
}
