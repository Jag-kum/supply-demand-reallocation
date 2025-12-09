'use client';

import { Fragment } from 'react';

interface LocationStock {
  _id: string;
  name: string;
  city: string;
  quantity: number;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    _id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
  } | null;
  stock: LocationStock[];
  onOrder: (productId: string, locationId: string, quantity: number) => Promise<void> | void;
}

export default function ProductDetailModal({ isOpen, onClose, product, stock, onOrder }: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">{product.description || 'No description provided.'}</p>
          <div className="text-sm text-gray-800">Category: <span className="font-medium">{product.category}</span></div>
          <div className="text-sm text-gray-800">Price: <span className="font-semibold">${product.price.toFixed(2)}</span></div>
          <div>
            <h4 className="font-semibold mb-2">Availability by Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stock.map(s => (
                <div key={s._id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">{s.city}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${s.quantity === 0 ? 'bg-red-100 text-red-700' : s.quantity < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {s.quantity}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      defaultValue={1}
                      className="w-16 px-2 py-1 border rounded-md text-sm"
                      id={`qty-${s._id}`}
                    />
                    <button
                      type="button"
                      disabled={s.quantity === 0}
                      onClick={() => {
                        const el = document.getElementById(`qty-${s._id}`) as HTMLInputElement | null;
                        const qty = Math.max(1, Math.min(s.quantity, Number(el?.value || 1)));
                        onOrder(product._id, s._id, qty);
                      }}
                      className="px-3 py-1 rounded-md text-sm bg-blue-600 disabled:bg-gray-300 text-white"
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 border-t text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}


