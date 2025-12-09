'use client';

import { useState } from 'react';

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

interface ProductCardProps {
  product: Product;
  stock: Stock[];
  onOrder?: (productId: string, locationId: string, quantity: number) => void;
  onPurchase?: (orderId: string) => void;
  showActions?: boolean;
}

export default function ProductCard({ 
  product, 
  stock,
  onOrder, 
  onPurchase, 
  showActions = true 
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Filter stock for this product
  const productStock = stock.filter(s => s.productId === product._id);
  
  // Calculate total stock across all locations
  const totalStock = productStock.reduce((sum, s) => sum + s.quantity, 0);
  
  // Get stock by location for display
  const stockByLocation = productStock.map(s => ({
    locationId: s.locationId._id,
    locationName: s.locationId.name,
    city: s.locationId.city,
    stock: s.quantity
  }));

  const getStockStatus = () => {
    if (totalStock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (totalStock < 5) return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus();

  const handleOrder = () => {
    if (onOrder && selectedLocation) {
      onOrder(product._id, selectedLocation, quantity);
    } else {
      alert('Please select a location');
    }
  };

  const handlePurchase = () => {
    if (onPurchase) {
      // For now, we'll just show a message since purchase requires an order ID
      alert('Please order the product first, then purchase from your orders');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="h-48 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20"></div>
        <div className="text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">Product Image</p>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full text-gray-600 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 truncate mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">per unit</span>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color} ${
              totalStock === 0 ? 'bg-red-100' : 
              totalStock < 5 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                totalStock === 0 ? 'bg-red-500' : 
                totalStock < 5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              {stockStatus.text} ({totalStock})
            </span>
          </div>
        </div>

        {/* Stock by Location */}
        {stockByLocation.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Stock by Location:</h4>
            <div className="space-y-1">
              {stockByLocation.map((location) => (
                <div key={location.locationId} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">{location.locationName}, {location.city}</span>
                  <span className={`font-medium ${location.stock === 0 ? 'text-red-600' : location.stock < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {location.stock} units
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showActions && totalStock > 0 && (
          <div className="space-y-4">
            {/* Location Selector */}
            <div>
              <label htmlFor={`location-${product._id}`} className="text-sm font-semibold text-gray-700">
                Select Location:
              </label>
              <select
                id={`location-${product._id}`}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Choose a location</option>
                {stockByLocation.filter(loc => loc.stock > 0).map((location) => (
                  <option key={location.locationId} value={location.locationId}>
                    {location.locationName}, {location.city} ({location.stock} available)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <label htmlFor={`quantity-${product._id}`} className="text-sm font-semibold text-gray-700">
                Quantity:
              </label>
              <input
                id={`quantity-${product._id}`}
                type="number"
                min="1"
                max={selectedLocation ? stockByLocation.find(loc => loc.locationId === selectedLocation)?.stock || 0 : totalStock}
                value={quantity}
                onChange={(e) => {
                  const maxQty = selectedLocation ? stockByLocation.find(loc => loc.locationId === selectedLocation)?.stock || 0 : totalStock;
                  setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)));
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center font-medium"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleOrder}
                disabled={!selectedLocation}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Order</span>
              </button>
              <button
                onClick={handlePurchase}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span>Purchase</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
