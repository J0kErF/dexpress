import { connectToDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import AdminPaymentForm from "@/components/custom/admin/AdminPaymentForm";

export default async function AdminNewPaymentPage() {
  await connectToDB();

  const storesRaw = await Store.find().select("_id businessName").lean();

  const stores = storesRaw.map((store) => ({
    _id: (store._id as { toString(): string }).toString(),
    businessName: store.businessName as string,
  }));

  return (
    <div className="p-4 max-w-xl mx-auto">
      <AdminPaymentForm stores={stores} />
    </div>
  );
}
