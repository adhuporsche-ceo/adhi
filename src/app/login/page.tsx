'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/actions/auth';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/10 via-zinc-950 to-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 font-black text-white text-xl shadow-lg shadow-orange-600/30 mb-4 animate-bounce">
            K
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-white">Sign in to KORE</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Access your campus smart canteen console
          </p>
        </div>

        <form action={action} className="mt-8 space-y-6">
          {state?.error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/30 border border-red-900/30 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@kore.com"
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-10 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-10 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? 'Logging you in...' : 'Sign In'}
          </button>



          <div className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-orange-400 hover:text-orange-300">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
