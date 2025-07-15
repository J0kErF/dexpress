// app/admin/users/[id]/page.tsx

import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import EditUserForm from "@/components/custom/admin/EditUserForm";
import { notFound } from "next/navigation";

interface Props {
    params: { id: string };
}

export default async function AdminUserEditPage({ params }: Props) {
    await connectToDB();

    const userDoc = await User.findById(params.id).lean();

    if (!userDoc || Array.isArray(userDoc)) return notFound();

    const user = {
        _id: userDoc._id?.toString() || "",
        fullName: userDoc.fullName || "",
        clerkId: userDoc.clerkId || "",
        role: userDoc.role || "store",
        businessId: userDoc.businessId?.toString() || "none",
        isActive: userDoc.isActive ?? true,
    };

    const stores = await Store.find({}, "_id businessName").lean();
    const formattedStores = stores.map((s) => ({
        _id: (s._id as any).toString(),
        businessName: s.businessName,
    }));


    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-right">✏️ עריכת משתמש</h1>
            <EditUserForm user={user} stores={formattedStores} />
        </div>
    );
}
