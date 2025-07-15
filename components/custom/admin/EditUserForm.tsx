"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  user: {
    _id: string;
    fullName: string;
    clerkId: string;
    role: string;
    businessId?: string;
    isActive: boolean;
  };
  stores: {
    _id: string;
    businessName: string;
  }[];
}

export default function EditUserForm({ user, stores }: Props) {
  const [fullName, setFullName] = useState(user.fullName);
  const [clerkId, setClerkId] = useState(user.clerkId);
  const [role, setRole] = useState(user.role || "store");
  const [businessId, setBusinessId] = useState(user.businessId ?? "none");
  const [isActive, setIsActive] = useState(user.isActive);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          clerkId,
          role,
          businessId: businessId === "none" ? null : businessId,
          isActive,
        }),
      });

      if (!res.ok) throw new Error("שגיאה בעדכון המשתמש");
      toast.success("המשתמש עודכן בהצלחה ✨");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto border shadow-sm text-right" dir="rtl">
      <CardHeader>
        <CardTitle className="text-xl">📝 עריכת משתמש</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">שם מלא</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="שם מלא"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Clerk ID</label>
          <Input
            value={clerkId}
            onChange={(e) => setClerkId(e.target.value)}
            placeholder="Clerk ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">תפקיד</label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="בחר תפקיד" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="store">Store</SelectItem>
              <SelectItem value="courier">Courier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">עסק משויך</label>
          <Select value={businessId} onValueChange={setBusinessId}>
            <SelectTrigger>
              <SelectValue placeholder="בחר עסק" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ללא עסק</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store._id} value={store._id}>
                  {store.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">סטטוס פעיל</span>
          <div dir="ltr">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <Button onClick={handleUpdate} disabled={loading} className="w-full">
          {loading ? "שומר..." : "שמור שינויים"}
        </Button>
      </CardContent>
    </Card>
  );
}
