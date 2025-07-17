import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Store from "@/models/Store";
import PaymentStoreCard from "@/components/custom/admin/PaymentStoreCard";
import Filters from "@/components/custom/admin/Filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO, isEqual, startOfDay, endOfDay } from "date-fns";

// Define a specific type for the page component's props to avoid conflicts
type AdminPaymentsPageProps = {
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
};

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  await connectToDB();

  // Extract and sanitize search parameters
  const storeId =
    typeof searchParams?.storeId === "string"
      ? searchParams.storeId.trim()
      : "";

  const fromRaw =
    typeof searchParams?.from === "string" ? searchParams.from : null;
  const toRaw =
    typeof searchParams?.to === "string" ? searchParams.to : null;

  // Parse date strings into Date objects
  const from = fromRaw ? parseISO(fromRaw) : null;
  const to = toRaw ? parseISO(toRaw) : null;

  // Fetch all stores for filtering purposes
  const allStores = (
    await Store.find({}, "_id businessName").lean()
  ).map((store) => ({
    _id: (store._id as { toString(): string }).toString(),
    businessName: store.businessName,
  }));

  // Build the MongoDB query object based on filters
  const query: any = {}; // Using 'any' here for flexibility in query construction

  if (storeId && storeId !== "all") {
    query.storeId = storeId;
  }

  // Handle date range filtering
  if (from && to && isEqual(from, to)) {
    // If 'from' and 'to' dates are the same, query for the entire day
    query.date = { $gte: startOfDay(from), $lte: endOfDay(to) };
  } else if (from || to) {
    // If only one date is provided, create a partial range query
    query.date = {};
    if (from) query.date.$gte = from;
    if (to) query.date.$lte = to;
  }

  // Fetch payments from the database with population and sorting
  const payments = await Payment.find(query)
    .populate({ path: "orders", select: "_id orderNumber" }) // Populate associated orders
    .sort({ createdAt: -1 }) // Sort by creation date, descending
    .lean(); // Return plain JavaScript objects

  // Clean and format payment data for display
  const cleaned = payments.map((p) => ({
    _id: (p._id as { toString(): string }).toString(),
    storeId: p.storeId?.toString?.() ?? "",
    date: p.date?.toISOString() ?? null,
    amount: p.amount,
    type: p.type,
    notes: p.notes ?? "",
    orders: (p.orders || []).map((o: any) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber || "ללא מזהה", // Default for missing order number
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
          {/* Filters component to apply search parameters */}
          <Filters
            stores={allStores}
            selectedStoreId={storeId}
            from={from}
            to={to}
          />
        </CardContent>
      </Card>

      {/* Conditional rendering based on whether payments are found */}
      {cleaned.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg mt-12">
          לא נמצאו תשלומים תואמים 💸
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Render PaymentStoreCard for each found payment */}
          {cleaned.map((payment) => (
            <PaymentStoreCard key={payment._id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}