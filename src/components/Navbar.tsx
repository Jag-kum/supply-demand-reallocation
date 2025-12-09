'use client';

import { useState } from 'react';

interface NavbarProps {
  userRole: string | null;
  onLogout: () => void;
}

export default function Navbar({ userRole, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Supply & Demand
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
                {userRole === 'buyer' && (
                  <a
                    href="/buyer"
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    🛒 Products
                  </a>
                )}
                {userRole === 'seller' && (
                  <a
                    href="/seller"
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    📊 Dashboard
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {userRole && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-200">
                    <span className="text-sm text-gray-700">
                      Role: <span className="font-semibold capitalize text-blue-600">{userRole}</span>
                    </span>
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="/"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </a>
            {userRole === 'buyer' && (
              <a
                href="/buyer"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Products
              </a>
            )}
            {userRole === 'seller' && (
              <a
                href="/seller"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Dashboard
              </a>
            )}
            {userRole && (
              <div className="border-t border-gray-200 pt-4">
                <div className="px-3 py-2 text-sm text-gray-700">
                  Role: <span className="font-medium capitalize">{userRole}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium mt-2"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
