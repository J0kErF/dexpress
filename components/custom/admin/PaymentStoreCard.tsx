"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface PaymentCardData {
  _id: string;
  storeId: string;
  date: string | null;
  amount: number;
  type: string;
  notes?: string;
  orders: {
    _id: string;
    orderNumber: string;
  }[];
  createdAt: string | null;
  updatedAt: string | null;
}

export default function PaymentStoreCard({ payment }: { payment: PaymentCardData }) {
  const [storeName, setStoreName] = useState<string>("טוען שם חנות...");
  const [storeError, setStoreError] = useState<boolean>(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`/api/stores/${payment.storeId}`);
        if (!res.ok) throw new Error("Store fetch failed");
        const data = await res.json();
        setStoreName(data.businessName || "לא ידוע");
      } catch (err) {
        setStoreError(true);
        setStoreName("חנות לא זמינה");
      }
    };

    if (payment.storeId) fetchStore();
  }, [payment.storeId]);

  return (
    <div className="bg-white shadow rounded-2xl p-4 space-y-2 border">
      {/* Store Name from API */}
      <Link href={`stores/${payment.storeId}`}>
        <h3 className="text-base font-semibold text-blue-700 hover:underline">
          🏪 {storeName}
        </h3>
      </Link>

      {/* Payment Date */}
      <div className="text-sm text-gray-500">
        🗓 {payment.date ? format(new Date(payment.date), "dd/MM/yyyy") : "לא זמין"}
      </div>

      {/* Payment Amount */}
      <div className="text-lg font-bold text-blue-700">
        ₪ {payment.amount.toLocaleString()}
      </div>

      {/* Payment Type */}
      <div className="text-sm">
        סוג תשלום: <b className="text-green-700">{payment.type}</b>
      </div>

      {/* Number of Orders */}
      <div className="text-sm">
        מספר הזמנות: {payment.orders?.length || 0}
      </div>

      {/* Shipment Links */}
      {payment.orders?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {payment.orders.map((order) => (
            <Link
              key={order._id}
              href={`/store/shipments?id=${order._id}`}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              הזמנה #{order.orderNumber}
            </Link>
          ))}
        </div>
      )}

      {/* Optional Notes */}
      {payment.notes && (
        <div className="text-xs mt-3 italic text-gray-600 border-t pt-2">
          📝 {payment.notes}
        </div>
      )}
    </div>
  );
}
