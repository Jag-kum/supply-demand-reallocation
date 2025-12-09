'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

interface Order { _id: string; productId: { name: string; price: number }; locationId: { name: string; city: string }; quantity: number; status: 'ordered'|'purchased'|'cancelled'; timestamp: string; }

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const parsed = user ? JSON.parse(user) : null;
    if (parsed?.id) setUserId(parsed.id);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const res = await api.getUserOrders(userId);
      if (res.success) setOrders(res.data);
    };
    load();
  }, [userId]);

  const badge = (s: string) => s==='purchased' ? 'bg-green-100 text-green-700' : s==='ordered' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';

  const cancel = async (id: string) => {
    const res = await api.cancelOrder(id);
    if (res.success) setOrders(prev => prev.map(o => o._id===id? { ...o, status: 'cancelled'} : o));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('orders:update'));
    }
  };

  const retry = async (o: Order) => {
    // Try to purchase the reservation
    const res = await api.purchaseProduct(o._id);
    if (res.success) setOrders(prev => prev.map(x => x._id===o._id ? { ...x, status: 'purchased'} : x));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('orders:update'));
    }
  };

  return (
    <div className="bg-white rounded-xl border p-4 overflow-x-auto">
      <table className="min-w-full sm:min-w-[720px] lg:min-w-[900px]">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase">
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Location</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Price</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody className="text-xs sm:text-sm">
          {orders.map(o => (
            <tr key={o._id} className="border-t">
              <td className="py-2 pr-4 font-medium text-gray-900">{o.productId?.name || '-'}</td>
              <td className="py-2 pr-4 text-gray-700">{o.locationId?.name}, {o.locationId?.city}</td>
              <td className="py-2 pr-4">{o.quantity}</td>
              <td className="py-2 pr-4">${o.productId?.price?.toFixed?.(2) || '0.00'}</td>
              <td className="py-2 pr-4 font-semibold">${((o.productId?.price || 0) * o.quantity).toFixed(2)}</td>
              <td className="py-2 pr-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge(o.status)}`}>{o.status}</span></td>
              <td className="py-2 pr-4 text-gray-500">{new Date(o.timestamp).toLocaleString()}</td>
              <td className="py-2 pr-4">
                <div className="flex gap-2">
                  {o.status === 'ordered' && (
                    <>
                      <button onClick={()=>retry(o)} className="px-3 py-1 rounded-md text-xs bg-green-600 text-white">Purchase</button>
                      <button onClick={()=>cancel(o._id)} className="px-3 py-1 rounded-md text-xs bg-red-600 text-white">Cancel</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


