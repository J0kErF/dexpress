import { connectToDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import AdminPaymentForm from "@/components/custom/admin/AdminPaymentForm";

export default async function AdminNewPaymentPage() {
  await connectToDB();

  const storesRaw = await Store.find().select("_id businessName").lean();

  const stores = storesRaw.map((store) => ({
    ...store,
    _id: store._id.toString(),
  }));

  return (
    <div className="p-4 max-w-xl mx-auto">
      <AdminPaymentForm stores={stores} />
    </div>
  );
}
