'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

export default function BuyerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [orderedCount, setOrderedCount] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Load user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRaw = localStorage.getItem('user');
      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (user?.id) setUserId(user.id);
      } catch {}
    }
  }, []);

  // Fetch count on load/nav and listen for updates
  useEffect(() => {
    const fetchCount = async () => {
      if (!userId) return;
      try {
        const res = await api.getUserOrders(userId);
        if (res.success) {
          const orders = res.data || [];
          // Count non-cancelled orders
          const count = orders.filter((o: any) => o.status !== 'cancelled').length;
          setOrderedCount(count);
        }
      } catch {
        // Fallback to localStorage indicator if API fails
        const count = Number(localStorage.getItem('orderedCount') || '0');
        setOrderedCount(isNaN(count) ? 0 : count);
      }
    };

    fetchCount();

    const handler = () => fetchCount();
    if (typeof window !== 'undefined') {
      window.addEventListener('orders:update', handler as any);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orders:update', handler as any);
      }
    };
  }, [userId, pathname]);

  const handleLogout = () => {
    // Clear any user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orderedCount');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    // Redirect to home page
    router.push('/');
  };

  const Tab = ({ href, label }: { href: string; label: string }) => {
    const active = pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold">B</div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Buyer Dashboard
              </h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-2">
                <a
                  href="/"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  🏠 Home
                </a>
                <Tab href="/buyer/products" label="Products" />
                <Tab href="/buyer/orders" label="My Orders" />
                <Tab href="/buyer/recommendations" label="Recommendations" />
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-200">
                  <span className="text-sm text-gray-700">
                    Role: <span className="font-semibold capitalize text-blue-600">buyer</span>
                  </span>
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Ordered: {orderedCount}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-b-lg">
            <a
              href="/"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium"
            >
              🏠 Home
            </a>
            <a
              href="/buyer/products"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname?.startsWith('/buyer/products') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Products
            </a>
            <a
              href="/buyer/orders"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname?.startsWith('/buyer/orders') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Orders
            </a>
            <a
              href="/buyer/recommendations"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname?.startsWith('/buyer/recommendations') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Recommendations
            </a>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-gray-600">Ordered: {orderedCount}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


