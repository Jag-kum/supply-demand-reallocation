'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/utils/api';
import ProductDetailModal from '@/components/ProductDetailModal';

interface Product { _id: string; name: string; category: string; price: number; description?: string; }
interface StockRow { _id: string; productId: { _id: string }; locationId: { _id: string; name: string; city: string }; quantity: number; }

export default function BuyerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    const load = async () => {
      const [pr, st] = await Promise.all([api.getProducts(), api.getAllStock()]);
      if (pr.success) setProducts(pr.data);
      if (st.success) setStock(st.data);
    };
    load();
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      if (availableOnly) {
        const qty = stock.filter(s => s.productId._id === p._id).reduce((sum, s) => sum + s.quantity, 0);
        if (qty <= 0) return false;
      }
    return true;
    });
  }, [products, stock, search, category, availableOnly]);

  const productStock = (productId: string) => stock.filter(s => s.productId._id === productId);

  const order = async (productId: string, locationId: string, quantity: number) => {
    const res = await api.orderProduct(productId, locationId, quantity);
    if (res?.success) {
      // Optimistically update stock
      setStock(prevStock => {
        const newStock = [...prevStock];
        const stockIndex = newStock.findIndex(s => s.productId._id === productId && s.locationId._id === locationId);
        if (stockIndex !== -1) {
          newStock[stockIndex] = {
            ...newStock[stockIndex],
            quantity: newStock[stockIndex].quantity - quantity
          };
        }
        return newStock;
      });

      // Notify navbar to refresh ordered count
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('orders:update'));
      }

      // Refetch stock to ensure consistency
      api.getAllStock().then(st => {
        if (st.success) setStock(st.data);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input className="flex-1 px-3 py-2 border rounded-lg" placeholder="Search products" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="px-3 py-2 border rounded-lg" value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={availableOnly} onChange={e=>setAvailableOnly(e.target.checked)} /> Available only
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const pStock = productStock(p._id);
          const total = pStock.reduce((s, r) => s + r.quantity, 0);
          const badge = total === 0 ? 'bg-red-100 text-red-700' : total < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
          return (
            <div key={p._id} className="bg-white rounded-xl border p-4 flex flex-col">
              <div className="font-semibold text-gray-900">{p.name}</div>
              <div className="text-sm text-gray-500">{p.category}</div>
              <div className="mt-2 text-sm text-gray-700 line-clamp-2">{p.description}</div>
              <div className="mt-3 text-gray-900 font-semibold">${p.price.toFixed(2)}</div>
              <div className="mt-3 text-xs">
                <div className="font-medium mb-1">Per-location stock</div>
                <div className="space-y-1">
                  {pStock.map(s => (
                    <div key={s._id} className="flex justify-between text-gray-700">
                      <span>{s.locationId.city}</span>
                      <span className={`px-2 py-0.5 rounded-full ${s.quantity===0?'bg-red-100 text-red-700':s.quantity<5?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{s.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge}`}>{total===0?'Out of Stock': total<5?'Low Stock':'In Stock'}</span>
                <button onClick={()=>setSelected(p)} className="ml-auto px-3 py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-200">Details</button>
              </div>
            </div>
          );
        })}
      </div>

      <ProductDetailModal
        isOpen={!!selected}
        onClose={()=>setSelected(null)}
        product={selected}
        stock={(selected?productStock(selected._id):[]).map(s=>({ _id: s.locationId._id, name: s.locationId.name, city: s.locationId.city, quantity: s.quantity }))}
        onOrder={order}
      />
    </div>
  );
}


