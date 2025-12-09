'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SimpleChart from '@/components/SimpleChart';
import ProductForm from '@/components/ProductForm';
import ProductsTable from '@/components/ProductsTable';
import LocationManagement from '@/components/LocationManagement';
import InventoryManagement from '@/components/InventoryManagement';
import { api } from '@/utils/api';

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

interface Recommendation {
  _id: string;
  productId: {
    _id: string;
    name: string;
    category: string;
    price: number;
  };
  fromLocationId: {
    _id: string;
    name: string;
    city: string;
  };
  toLocationId: {
    _id: string;
    name: string;
    city: string;
  };
  quantity: number;
  priority: 'high' | 'medium' | 'low';
  approved: boolean;
  createdAt: string;
}

interface DashboardData {
  totalProducts: number;
  totalLocations: number;
  lowStockItems: number;
  totalValue: number;
  stock: Stock[];
}

export default function SellerPage() {
  const [user, setUser] = useState<{ email: string; role: string; id: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'locations' | 'inventory'>('overview');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormLoading, setIsProductFormLoading] = useState(false);
  const router = useRouter();

  const toCityCode = (city: string) => {
    const upper = (city || '').toUpperCase();
    if (upper.startsWith('CHEN')) return 'CHE';
    if (upper.startsWith('BANG') || upper.startsWith('BENG')) return 'BLR';
    if (upper.startsWith('HYD')) return 'HYD';
    return upper.slice(0,3);
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'seller') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardResponse, recommendationsResponse, productsResponse] = await Promise.all([
        api.getSellerDashboard(),
        api.getRecommendations(),
        api.getProducts()
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      } else {
        setError('Failed to load dashboard data');
      }

      if (recommendationsResponse.success) {
        setRecommendations(recommendationsResponse.data);
      }

      if (productsResponse.success) {
        setProducts(productsResponse.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTransfer = async (recommendationId: string) => {
    try {
      const response = await api.approveTransfer(recommendationId);
      if (response.success) {
        alert('Transfer approved successfully');
        loadDashboardData(); // Refresh data
      } else {
        alert(response.message || 'Failed to approve transfer');
      }
    } catch (err) {
      alert('Failed to approve transfer');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const response = await api.deleteProduct(productId);
        if (response.success) {
          alert('Product deleted successfully');
          loadDashboardData(); // Refresh data
        } else {
          alert(response.message || 'Failed to delete product');
        }
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleProductSubmit = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    setIsProductFormLoading(true);
    try {
      if (editingProduct) {
        const response = await api.updateProduct(editingProduct._id, productData);
        if (response.success) {
          alert('Product updated successfully');
          loadDashboardData(); // Refresh data
          setIsProductFormOpen(false);
        } else {
          alert(response.message || 'Failed to update product');
        }
      } else {
        const response = await api.addProduct(productData);
        if (response.success) {
          alert('Product added successfully');
          loadDashboardData(); // Refresh data
          setIsProductFormOpen(false);
        } else {
          alert(response.message || 'Failed to add product');
        }
      }
    } catch (err) {
      alert(editingProduct ? 'Failed to update product' : 'Failed to add product');
    } finally {
      setIsProductFormLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getStockByProduct = (productId: string) => {
    if (!dashboardData) return [];
    return dashboardData.stock.filter(s => s.productId === productId);
  };

  const getStockByLocation = (locationId: string) => {
    if (!dashboardData) return [];
    return dashboardData.stock.filter(s => s.locationId._id === locationId);
  };

  // Compute product-derived stock totals and metrics
  const stockTotals: Record<string, number> = products.reduce((acc, p) => {
    const sum = (dashboardData?.stock || []).reduce((s, st: any) => {
      const pid = typeof st.productId === 'string' ? st.productId : st.productId?._id;
      return pid === p._id ? s + (st.quantity || 0) : s;
    }, 0);
    acc[p._id] = sum;
    return acc;
  }, {} as Record<string, number>);

  const totalProducts = products.length;
  const lowStockItems = products.filter(p => {
    const qty = stockTotals[p._id] || 0;
    return qty > 0 && qty < 5;
  }).length;
  const outOfStockItems = products.filter(p => (stockTotals[p._id] || 0) === 0).length;
  const healthyStockItems = products.filter(p => (stockTotals[p._id] || 0) >= 5).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * (stockTotals[p._id] || 0), 0);

  const normalizeCategory = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('appliance')) return 'Appliances';
    if (c.includes('furn')) return 'Furniture';
    if (c.includes('elect')) return 'Electronics';
    return 'Other';
  };
  const categoryCounts: Record<string, number> = products.reduce((acc, p) => {
    const key = normalizeCategory(p.category);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryData = Object.entries(categoryCounts).map(([label, value]) => ({ label, value }));

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const stockLevelData = [
    { label: 'Healthy (≥5)', value: healthyStockItems },
    { label: 'Low (1-4)', value: lowStockItems },
    { label: 'Out (0)', value: outOfStockItems }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar userRole={user.role} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Seller Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Monitor your inventory, analyze performance, and leverage AI-powered recommendations
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Overview</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'products'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Products</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('locations')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'locations'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Locations</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'inventory'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Inventory</span>
                  </div>
                </button>
              </nav>
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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' ? (
                <>
                  {/* Stats Overview (derived from Products table) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                  <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate">Total Products</dt>
                            <dd className="text-2xl font-bold text-gray-900">{totalProducts}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate">Low Stock Items</dt>
                            <dd className="text-2xl font-bold text-gray-900">{lowStockItems}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate">Out of Stock Items</dt>
                            <dd className="text-2xl font-bold text-gray-900">{outOfStockItems}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate">Healthy Stock Items</dt>
                            <dd className="text-2xl font-bold text-gray-900">{healthyStockItems}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate">Total Inventory Value</dt>
                            <dd className="text-2xl font-bold text-gray-900">${totalInventoryValue.toFixed(2)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate">Top Category</dt>
                            <dd className="text-xl font-bold text-gray-900">{topCategory}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Stock Level Chart */}
                <div className="animate-fade-in-up">
                  <SimpleChart
                    data={stockLevelData}
                    title="Stock Levels"
                    type="bar"
                  />
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (!dashboardData) return;
                    const rows = dashboardData.stock.map(s => {
                      const city = s.locationId.city || '';
                      const code = toCityCode(city);
                      return {
                        product: (s as any).productId.name,
                        category: (s as any).productId.category,
                        price: (s as any).productId.price,
                        location_code: code,
                        location_city: city,
                        location_name: (s as any).locationId.name,
                        quantity: s.quantity
                      };
                    });
                    const headers = Object.keys(rows[0] || {});
                    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'inventory_stats.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Download CSV
                </button>
              </div>
                </div>

                {/* Category Distribution */}
                <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <SimpleChart
                    data={categoryData}
                    title="Inventory by Category"
                    type="pie"
                  />
                </div>
              </div>

              {/* Current Stock Table */}
              {dashboardData && (
                <div className="bg-white shadow-2xl overflow-hidden rounded-2xl border border-gray-100 mb-10 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Current Stock</h3>
                        <p className="text-sm text-gray-500">One row per product-location with current quantity</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {dashboardData.stock.map((s) => {
                            const code = toCityCode(s.locationId.city);
                            return (
                              <tr key={`${s.productId._id}-${s.locationId._id}`} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-gray-900">{s.productId.name}</div>
                                  <div className="text-xs text-gray-500">{s.productId.category} • ${s.productId.price.toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  <span className="font-medium">{code}</span> — {s.locationId.name}, {s.locationId.city}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${s.quantity === 0 ? 'bg-red-100 text-red-800' : s.quantity < 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {s.quantity}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Recommendations */}
              <div className="bg-white shadow-2xl overflow-hidden rounded-2xl border border-gray-100 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <div className="px-6 py-6 sm:px-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Transfer Recommendations</h3>
                      <p className="text-sm text-gray-500">AI-powered suggestions for inventory optimization</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  {recommendations.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {recommendations.filter(rec => !rec.approved).map((rec) => (
                        <div key={rec._id} className="px-6 py-6 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{rec.productId.name}</h4>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                                  {rec.priority} priority
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                Transfer <span className="font-semibold text-blue-600">{rec.quantity}</span> units from
                                {' '}<span className="font-medium">{rec.fromLocationId.name}, {rec.fromLocationId.city}</span> to 
                                {' '}<span className="font-medium">{rec.toLocationId.name}, {rec.toLocationId.city}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  const a = rec.fromLocationId as any; const b = rec.toLocationId as any;
                                  if (a.latitude != null && a.longitude != null && b.latitude != null && b.longitude != null) {
                                    const R = 6371; // km
                                    const dLat = (b.latitude - a.latitude) * Math.PI / 180;
                                    const dLon = (b.longitude - a.longitude) * Math.PI / 180;
                                    const lat1 = a.latitude * Math.PI / 180; const lat2 = b.latitude * Math.PI / 180;
                                    const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
                                    const d = 2 * R * Math.asin(Math.sqrt(x));
                                    return `Distance: ${d.toFixed(1)} km`;
                                  }
                                  return 'Distance: N/A';
                                })()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Product: {rec.productId.category} • ${rec.productId.price.toFixed(2)} per unit
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleApproveTransfer(rec._id)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                              >
                                Approve Transfer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-gray-600">No transfer recommendations at the moment.</div>
                  )}
                </div>
              </div>
                </>
              ) : activeTab === 'products' ? (
                <>
                  {/* Products Tab */}
                  <div className="space-y-6">
                    {/* Add Product Button */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                        <p className="text-gray-600">Add, edit, and manage your product inventory</p>
                      </div>
                      <button
                        onClick={handleAddProduct}
                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Product</span>
                      </button>
                    </div>

                    {/* Products Table */}
                    <ProductsTable
                      products={products}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      isLoading={isLoading}
                      stockTotals={stockTotals}
                    />
                  </div>
                </>
              ) : activeTab === 'locations' ? (
                <>
                  {/* Locations Tab */}
                  <LocationManagement
                    onLocationAdded={() => loadDashboardData()}
                    onLocationUpdated={() => loadDashboardData()}
                    onLocationDeleted={() => loadDashboardData()}
                  />
                </>
              ) : (
                <>
                  {/* Inventory Tab */}
                  <InventoryManagement
                    onStockUpdated={() => loadDashboardData()}
                  />
                </>
              )}
            </>
          )}

          {/* Product Form Modal */}
          <ProductForm
            product={editingProduct}
            isOpen={isProductFormOpen}
            onClose={() => {
              setIsProductFormOpen(false);
              setEditingProduct(null);
            }}
            onSubmit={handleProductSubmit}
            isLoading={isProductFormLoading}
          />
        </div>
      </div>
    </div>
  );
}
