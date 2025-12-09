"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';

export default function BuyerHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/buyer/products');
  }, [router]);
  return null;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Stock {
  _id: string;
  productId: string;
  locationId: {
    _id: string;
    name: string;
    city: string;
    address: string;
  };
  quantity: number;
}

interface Location {
  _id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
}

export function LegacyBuyerPage() {
  const [user, setUser] = useState<{ email: string; role: string; id: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'buyer') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsResponse, stockResponse, locationsResponse] = await Promise.all([
        api.getProducts(searchTerm),
        api.getAllStock(),
        api.getLocations()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.data);
      } else {
        setError('Failed to load products');
      }

      if (stockResponse.success) {
        setStock(stockResponse.data);
      }

      if (locationsResponse.success) {
        setLocations(locationsResponse.data);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [searchTerm, user]);

  const handleOrder = async (productId: string, locationId: string, quantity: number) => {
    try {
      const response = await api.orderProduct(productId, locationId, quantity);
      if (response.success) {
        alert(`Ordered ${quantity} units successfully`);
        loadData(); // Reload data to update stock
      } else {
        alert(response.message || 'Failed to order product');
      }
    } catch (err) {
      alert('Failed to order product');
    }
  };

  const handlePurchase = async (orderId: string) => {
    try {
      const response = await api.purchaseProduct(orderId);
      if (response.success) {
        alert('Product purchased successfully');
        loadData(); // Reload data to update stock
      } else {
        alert(response.message || 'Failed to purchase product');
      }
    } catch (err) {
      alert('Failed to purchase product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar userRole={user.role} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Product Catalog
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing products and manage your purchases with our intelligent inventory system
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                  placeholder="Search products by name or category..."
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    {products.length} products
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, index) => (
                    <div key={product._id} className="animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <ProductCard
                        product={product}
                        stock={stock}
                        onOrder={handleOrder}
                        onPurchase={handlePurchase}
                        showActions={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm ? 'Try adjusting your search terms or browse all products.' : 'No products available at the moment. Check back later!'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
