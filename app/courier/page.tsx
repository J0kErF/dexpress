// app/courier/page.tsx   (Home / Welcome) – no map version
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/* ---------- Types ---------- */
interface Route {
  _id: string;
  date: string;
  startTime?: string;
  finishTime?: string;
  routeTotalPrice?: number;
  shipmentOrder: any[];
}

/* ---------- Component ---------- */
export default function CourierHomePage() {
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [history, setHistory] = useState<Route[]>([]);
  const [monthStats, setMonthStats] = useState<{ count: number; span: string }>({
    count: 0,
    span: "0:00:00",
  });

  /* fetch once ready */
  useEffect(() => {
    if (!isLoaded || !user) return;

    (async () => {
      setLoading(true);
      try {
        // history only
        const resHist = await fetch(
          `/api/routes/my-active/${user.id}?history=1`,
          { cache: "no-store" }
        );
        const { history: allHistory } = await resHist.json();
        setHistory(allHistory);

        // active
        const resAct = await fetch(`/api/routes/my-active/${user.id}`, {
          cache: "no-store",
        });
        const { active } = await resAct.json();
        setActiveRoute(active ?? null);

        // monthly stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthly = allHistory.filter(
          (r: Route) => new Date(r.date) >= monthStart
        );

        const totalMs = monthly.reduce((acc: number, r: Route) => {
          if (r.startTime && r.finishTime) {
            acc +=
              new Date(r.finishTime).getTime() -
              new Date(r.startTime).getTime();
          }
          return acc;
        }, 0);

        const totalSec = Math.floor(totalMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;

        setMonthStats({
          count: monthly.length,
          span: `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        });
      } catch {
        toast.error("שגיאה בטעינת נתוני השליח");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user]);

  /* loading skeleton */
  if (!isLoaded || loading)
    return (
      <main className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        טוען נתונים...
      </main>
    );

  /* ---------- UI ---------- */
  return (
    <main dir="rtl" className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      {/* Greeting */}
      <section className="text-center sm:text-right space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          👋 שלום, <span className="text-primary">{user?.firstName || "שליח"}</span>
        </h1>
        <p className="text-sm text-gray-600">הנה תמונת המצב שלך להיום</p>
      </section>

      {/* Cards stack */}
      <section className="space-y-4">

        {/* Active route */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg">🚚 המסלול של היום</CardTitle>
          </CardHeader>
          <CardContent>
            {activeRoute ? (
              <div className="space-y-1 text-sm text-gray-700">
                <div>
                  📅 {new Date(activeRoute.date).toLocaleDateString("he-IL")}
                </div>
                <div>
                  ⏱️{" "}
                  {activeRoute.startTime
                    ? `התחיל: ${new Date(
                        activeRoute.startTime
                      ).toLocaleTimeString("he-IL")}`
                    : "טרם התחיל"}
                </div>
                <div>📦 משלוחים: {activeRoute.shipmentOrder.length}</div>
                <div>
                  💰 סה״כ: {activeRoute.routeTotalPrice?.toFixed(2) || "0.00"} ₪
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">אין מסלול פעיל – המתן להקצאה</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly stats */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg">📊 סטטיסטיקה חודשית</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-1">
            <div>📂 מסלולים שהושלמו: {monthStats.count}</div>
            <div>⌛ זמן עבודה: {monthStats.span}</div>
          </CardContent>
        </Card>

        {/* Recent history */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg">🕓 מסלולים אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto text-sm">
            {history.length ? (
              history.slice(0, 10).map((r) => (
                <div
                  key={r._id}
                  className="border rounded-lg p-2 hover:bg-gray-50"
                >
                  <div>📅 {new Date(r.date).toLocaleDateString("he-IL")}</div>
                  <div>📦 {r.shipmentOrder.length} משלוחים</div>
                  <div>💰 {r.routeTotalPrice?.toFixed(2) || "0.00"} ₪</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">לא קיימים מסלולים קודמים</p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
