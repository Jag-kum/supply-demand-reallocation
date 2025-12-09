'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
}

interface Location {
  _id: string;
  name: string;
  city: string;
}

// Matches populated backend response from GET /api/stock/all
interface Stock {
  _id: string;
  productId: Product;   // populated object
  locationId: Location; // populated object
  quantity: number;
}

interface InventoryManagementProps {
  onStockUpdated?: () => void;
}

export default function InventoryManagement({ onStockUpdated }: InventoryManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    locationId: '',
    quantity: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, locationsRes, stockRes] = await Promise.all([
        api.getProducts(),
        api.getLocations(),
        api.getAllStock()
      ]);

      if (productsRes.success) setProducts(productsRes.data);
      if (locationsRes.success) setLocations(locationsRes.data);
      if (stockRes.success) setStock(stockRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const stockData = {
        productId: formData.productId,
        locationId: formData.locationId,
        quantity: parseInt(formData.quantity)
      };

      const response = await api.updateStock(stockData.productId, stockData.locationId, stockData.quantity);

      if (response.success) {
        setFormData({ productId: '', locationId: '', quantity: '' });
        setIsFormOpen(false);
        setEditingStock(null);
        loadData();
        onStockUpdated?.();
      }
    } catch (error) {
      console.error('Error saving stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (stockItem: Stock) => {
    setEditingStock(stockItem);
    setFormData({
      productId: (stockItem.productId as any)._id || (stockItem as any).productId,
      locationId: (stockItem.locationId as any)._id || (stockItem as any).locationId,
      quantity: stockItem.quantity.toString()
    });
    setIsFormOpen(true);
  };

  const getProductName = (prodOrId: Product | string) => {
    if (typeof prodOrId !== 'string' && (prodOrId as any).name) return (prodOrId as any).name;
    const p = products.find(x => x._id === (prodOrId as string));
    return p ? p.name : 'Unknown Product';
  };

  const getLocationLabel = (locOrId: string | Location) => {
    const loc = typeof locOrId === 'string' ? locations.find(l => l._id === locOrId) : locOrId;
    if (!loc) return 'Unknown Location';
    const city = loc.city || '';
    const upper = city.toUpperCase();
    const code = upper.startsWith('CHEN') ? 'CHE'
      : (upper.startsWith('BANG') || upper.startsWith('BENG')) ? 'BLR'
      : upper.startsWith('HYD') ? 'HYD'
      : upper.slice(0,3);
    return `${code} — ${loc.name} (${loc.city})`;
  };

  if (isLoading && stock.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => {
              setIsFormOpen(true);
              setEditingStock(null);
              setFormData({ productId: '', locationId: '', quantity: '' });
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Stock
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingStock ? 'Edit Stock' : 'Add Stock'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {product.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <select
                  required
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location._id} value={location._id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (editingStock ? 'Update' : 'Add')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingStock(null);
                  setFormData({ productId: '', locationId: '', quantity: '' });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stock.map((stockItem) => (
              <tr key={stockItem._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getProductName(stockItem.productId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getLocationLabel(stockItem.locationId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stockItem.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    stockItem.quantity === 0 
                      ? 'bg-red-100 text-red-800' 
                      : stockItem.quantity < 10 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {stockItem.quantity === 0 
                      ? 'Out of Stock' 
                      : stockItem.quantity < 10 
                        ? 'Low Stock' 
                        : 'In Stock'
                    }
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(stockItem)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
