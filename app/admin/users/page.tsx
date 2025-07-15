// SERVER COMPONENT

import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import mongoose from "mongoose";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { clerk } from "@/lib/clerk";
import { Phone, Building2, UserCog, Briefcase, Truck } from "lucide-react";

export default async function AdminUsersPage() {
  await connectToDB();

  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  // סינון מזהים חוקיים בלבד
  const businessIds = users
    .map((u) => u.businessId)
    .filter((id): id is string => !!id && mongoose.Types.ObjectId.isValid(id));

  const stores = await Store.find({ _id: { $in: businessIds } }, "_id businessName").lean();

  type StoreLean = { _id: string | { toString(): string }; businessName: string };
  const storeMap = Object.fromEntries(
    (stores as unknown as StoreLean[]).map((s) => [s._id.toString(), s.businessName])
  );

  // Fetch phone numbers from Clerk
  const userPhoneMap: Record<string, string | null> = {};
  await Promise.all(
    users.map(async (user) => {
      if (!user.clerkId) return;
      try {
        const clerkUser = await clerk.users.getUser(user.clerkId);
        userPhoneMap[user.clerkId] = clerkUser.phoneNumbers?.[0]?.phoneNumber ?? null;
      } catch (err) {
        console.error(`❌ Failed to fetch phone for clerkId ${user.clerkId}`, err);
        userPhoneMap[user.clerkId] = null;
      }
    })
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <Card>
        <CardHeader className="text-right">
          <CardTitle className="text-2xl font-bold">👥 ניהול משתמשים</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const storeName = user.businessId && storeMap[user.businessId];
            const phoneNumber = userPhoneMap[user.clerkId] || null;

            return (
              <Card
                key={(user._id as any).toString()}
                className="p-4 flex flex-col justify-between border border-muted rounded-2xl shadow-md"
              >
                <div className="space-y-2 text-right">
                  <div className="font-semibold text-lg flex items-center gap-2 justify-end">
                    <UserCog className="w-4 h-4" /> {user.fullName}
                  </div>

                  <div className="text-muted-foreground text-sm flex items-center gap-2 justify-end">
                    {user.role === "store" && <Briefcase className="w-4 h-4" />}
                    {user.role === "courier" && <Truck className="w-4 h-4" />}
                    {user.role === "admin" && <UserCog className="w-4 h-4" />}
                    תפקיד: {user.role}
                  </div>

                  {phoneNumber && (
                    <div className="text-muted-foreground text-sm flex items-center gap-2 justify-end">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${phoneNumber}`} className="text-blue-600 underline">
                        {phoneNumber}
                      </a>
                    </div>
                  )}

                  {storeName && (
                    <div className="text-muted-foreground text-sm flex items-center gap-2 justify-end">
                      <Building2 className="w-4 h-4" />
                      <Link
                        href={`/admin/stores/${user.businessId}`}
                        className="text-blue-600 underline"
                      >
                        {storeName}
                      </Link>
                    </div>
                  )}

                  <Badge className={user.isActive ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                    {user.isActive ? "פעיל" : "לא פעיל"}
                  </Badge>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link href={`/admin/users/${user._id}`}>
                    <Button size="sm">ניהול</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
