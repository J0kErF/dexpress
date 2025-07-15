"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

export default function WaitlistPage() {
  const { user, isSignedIn } = useUser();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("store");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/clerk/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.isActive && data.role === "store" && data.businessId !== "-1") {
              setRedirecting(true);
              window.location.replace("/store");
              return;
            } else if (data.isActive && data.role === "courier") {
              setRedirecting(true);
              window.location.replace("/courier");
              return;
            } else if (data.isActive && data.role === "admin") {
              setRedirecting(true);
              window.location.replace("/admin");
              return;
            } else {
              setFullName(data.fullName || "");
              setRole(data.role || "store");
              setIsExistingUser(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const url = isExistingUser
        ? `/api/users/clerk/${user.id}`
        : `/api/users/clerk`;

      const res = await fetch(url, {
        method: isExistingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          fullName,
          role,
          businessId: "-1",
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("הנתונים נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving user", error);
      toast.error("שגיאה בשמירת הנתונים.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn || pageLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-600 text-lg font-medium">
        טוען...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-right text-gray-800 bg-white">
      <Toaster />

      {/* Info Card */}
      <div className="w-full max-w-md mb-8 rounded-2xl border border-yellow-300 bg-yellow-50 p-5 shadow-md">
        <h2 className="text-lg font-semibold mb-2 text-yellow-700 flex items-center gap-2">
          <span className="text-xl">✅</span> קיבלנו את פרטיך בהצלחה
        </h2>
        <p className="text-sm leading-relaxed text-yellow-900">
          אחד מאנשי הצוות שלנו יצור איתך קשר בהקדם.
          תוכל לעדכן את הבקשה בכל עת על ידי מילוי מחדש של הטופס למטה.
          <br className="my-1" />
          אם זו הפעם הראשונה שלך, נודה לך מאוד על מילוי הטופס פעם אחת בלבד –
          זה עוזר לנו לתת מענה מדויק ומהיר יותר.
          <br />
          תודה על הסבלנות והאמון ב־<span className="font-bold text-yellow-600">Daleel Express</span> 💛
        </p>
      </div>

      {/* Form Title */}
      <h1 className="text-2xl font-bold text-yellow-800 mb-4">טופס משתמש</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <div>
          <label className="block text-sm mb-1 text-yellow-900">שם מלא</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="שם מלא"
            required
            className="border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-yellow-900">תפקיד</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-yellow-300 p-2 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="store">בעל חנות</option>
            <option value="courier">שליח</option>
          </select>
        </div>

        <Button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg py-2 transition-colors duration-200"
          disabled={loading}
        >
          {loading ? "שולח..." : "שמור שינויים"}
        </Button>
      </form>
    </div>
  );
}
