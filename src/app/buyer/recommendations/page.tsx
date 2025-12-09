'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

interface Rec { _id: string; productId: { _id: string; name: string; category: string; price: number }; toLocationId: { _id: string; name: string; city: string }; }

export default function BuyerRecsPage() {
  const [recs, setRecs] = useState<Rec[]>([]);

  useEffect(() => {
    const load = async () => {
      const r = await api.getRecommendations();
      if (r.success) setRecs(r.data);
    };
    load();
  }, []);

  const order = async (productId: string, locationId: string) => {
    await api.orderProduct(productId, locationId, 1);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recs.map(r => (
        <div key={r._id} className="bg-white border rounded-xl p-4 flex flex-col">
          <div className="font-semibold">{r.productId.name}</div>
          <div className="text-sm text-gray-500">{r.productId.category}</div>
          <div className="mt-2 text-gray-900 font-semibold">${r.productId.price.toFixed(2)}</div>
          <div className="mt-2 text-sm text-gray-700">Suggested Location: {r.toLocationId.name}, {r.toLocationId.city}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>order(r.productId._id, r.toLocationId._id)} className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white">Order</button>
          </div>
        </div>
      ))}
    </div>
  );
}


