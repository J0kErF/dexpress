import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import PaymentStoreCard from "@/components/custom/store/PaymentStoreCard";

export default async function PaymentsPage() {
  await connectToDB();

  const clerkUser = await currentUser();
  const user = await User.findOne({ clerkId: clerkUser?.id });

  if (!user || !user.businessId) {
    return <div className="p-4 text-red-500">החנות לא נמצאה.</div>;
  }
  const payments = await Payment.find({ storeId: user.businessId })
    .sort({ createdAt: -1 })
    .populate({
      path: "orders",
      select: "_id orderNumber", // 👈 ONLY include these fields
    })
    .lean();

  // ✅ Clean data to pass safely to Client Component
  const cleanedPayments = payments.map((payment) => ({
    _id: (payment._id as string | { toString(): string }).toString(),
    storeId: payment.storeId.toString(),
    date: payment.date?.toISOString?.() ?? null,
    amount: payment.amount,
    type: payment.type,
    notes: payment.notes,
    orders: (payment.orders || []).map((order: { _id: { toString: () => any; }; orderNumber: any; }) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber || "ללא מזהה",
    })),
    createdAt: payment.createdAt?.toISOString?.() ?? null,
    updatedAt: payment.updatedAt?.toISOString?.() ?? null,
  }));

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-right">📄 רשימת התשלומים שלך</h2>

      {cleanedPayments.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-12">
          אין תשלומים להצגה כרגע 💸
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cleanedPayments.map((payment) => (
            <PaymentStoreCard key={payment._id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}
