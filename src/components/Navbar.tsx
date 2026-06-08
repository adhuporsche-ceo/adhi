import Link from 'next/link';
import { getAuthedUser, logoutAction } from '@/app/actions/auth';
import { ChefHat, ShoppingBag, BarChart3, User, LogOut } from 'lucide-react';

export default async function Navbar() {
  const user = await getAuthedUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-google-blue font-bold text-white shadow-lg shadow-google-blue/30 transition-transform group-hover:scale-105">
                K
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                KORE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/menu" className="text-sm font-medium text-gray-600 hover:text-google-blue transition-colors">
                Browse Menu
              </Link>
              {user && user.role === 'STUDENT' && (
                <>
                  <Link href="/student" className="text-sm font-medium text-gray-600 hover:text-google-blue transition-colors">
                    Dashboard
                  </Link>
                </>
              )}
              {user && user.role === 'STAFF' && (
                <Link href="/kitchen" className="text-sm font-medium text-gray-600 hover:text-google-blue transition-colors flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4 text-google-red" /> Kitchen Console
                </Link>
              )}
              {user && user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-google-blue transition-colors flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-google-yellow" /> Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'STUDENT' && (
                  <Link href="/cart" className="relative p-2 text-gray-500 hover:text-google-blue transition-colors">
                    <ShoppingBag className="h-5 w-5" />
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                  <User className="h-4 w-4 text-google-blue" />
                  <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-google-blue border border-google-blue/30 uppercase">
                    {user.role}
                  </span>
                </div>
                <form action={logoutAction}>
                  <button type="submit" className="p-2 text-gray-500 hover:text-google-red transition-colors rounded-lg hover:bg-red-50">
                    <LogOut className="h-5 w-5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="text-sm font-medium bg-google-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-google-blue/20">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
