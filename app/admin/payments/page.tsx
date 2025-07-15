import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Store from "@/models/Store";
import PaymentStoreCard from "@/components/custom/admin/PaymentStoreCard";
import Filters from "@/components/custom/admin/Filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO, isEqual, startOfDay, endOfDay } from "date-fns";

interface PaymentWithStore {
  _id: any;
  storeId: any;
  date?: Date;
  amount: number;
  type: string;
  notes?: string;
  orders?: {
    _id: any;
    orderNumber?: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await connectToDB();

  const storeId = typeof searchParams?.storeId === "string" ? searchParams.storeId.trim() : "";
  const fromRaw = typeof searchParams?.from === "string" ? searchParams.from : null;
  const toRaw = typeof searchParams?.to === "string" ? searchParams.to : null;

  const from = fromRaw ? parseISO(fromRaw) : null;
  const to = toRaw ? parseISO(toRaw) : null;

  const allStores = (
    await Store.find({}, "_id businessName").lean()
  ).map((store) => ({
    _id: (store._id as { toString(): string }).toString(),
    businessName: store.businessName,
  }));

  const query: any = {};

  // ✅ Handle "all" and store filtering
  if (storeId && storeId !== "all") {
    query.storeId = storeId;
  }

  // ✅ Handle all date filter combinations
  if (from && to && isEqual(from, to)) {
    query.date = { $gte: startOfDay(from), $lte: endOfDay(to) };
  } else if (from || to) {
    query.date = {};
    if (from) query.date.$gte = from;
    if (to) query.date.$lte = to;
  }

  const payments = await Payment.find(query)
    .populate({ path: "orders", select: "_id orderNumber" })
    .sort({ createdAt: -1 })
    .lean<PaymentWithStore[]>();

  const cleaned = payments.map((p) => ({
    _id: p._id.toString(),
    storeId: p.storeId?.toString?.() ?? "",
    date: p.date?.toISOString() ?? null,
    amount: p.amount,
    type: p.type,
    notes: p.notes ?? "",
    orders: (p.orders || []).map((o) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber || "ללא מזהה",
    })),
    createdAt: p.createdAt?.toISOString() ?? null,
    updatedAt: p.updatedAt?.toISOString() ?? null,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="text-right">
          <CardTitle className="text-2xl font-bold">🔐 ניהול תשלומים</CardTitle>
        </CardHeader>
        <CardContent>
          <Filters
            stores={allStores}
            selectedStoreId={storeId}
            from={from}
            to={to}
          />
        </CardContent>
      </Card>

      {cleaned.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg mt-12">
          לא נמצאו תשלומים תואמים 💸
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cleaned.map((payment) => (
            <PaymentStoreCard key={payment._id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}
