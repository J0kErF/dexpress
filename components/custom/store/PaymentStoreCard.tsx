"use client";

import Link from "next/link";
import { format } from "date-fns";

export default function PaymentStoreCard({ payment }: { payment: any }) {
  return (
    <div className="bg-white shadow rounded-2xl p-4 space-y-2 border">
      {/* Payment Date */}
      <div className="text-sm text-gray-500">
        🗓 {format(new Date(payment.date), "dd/MM/yyyy")}
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
          {payment.orders.map((order: { _id: string; orderNumber: string }) => (
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
          {payment.notes}
        </div>
      )}
    </div>
  );
}
