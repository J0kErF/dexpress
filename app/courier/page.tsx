"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const MapboxShipments = dynamic(
  () => import("@/components/custom/courier/MapboxShipments"),
  { ssr: false }
);

interface Route {
  _id: string;
  date: string;
  startTime?: string;
  finishTime?: string;
  routeTotalPrice?: number;
  shipmentOrder: any[];
}

export default function CourierWelcomePage() {
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [routeHistory, setRouteHistory] = useState<Route[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/routes/my-active");
        const data = await res.json();
        setActiveRoute(data.active || null);
        setRouteHistory(data.history || []);
      } catch {
        toast.error("שגיאה בטעינת נתוני השליח");
      }
    })();
  }, []);

  return (
    <main
      dir="rtl"
      className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-20" /* bottom-bar padding */
    >
      {/* top greeting */}
      <section className="text-center sm:text-right space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          👋 שלום, <span className="text-primary">שליח יקר</span>
        </h1>
        <p className="text-sm text-gray-600">
          הנה התמונה המלאה של המשימות שלך היום
        </p>
      </section>

      {/* grid: cards left, map right */}
      <section className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* current route card */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                🚚 המסלול של היום
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeRoute ? (
                <div className="space-y-1 text-sm text-gray-700">
                  <div>
                    📅 {new Date(activeRoute.date).toLocaleDateString("he-IL")}
                  </div>
                  <div>
                    ⏱️&nbsp;
                    {activeRoute.startTime
                      ? `התחיל: ${new Date(
                          activeRoute.startTime
                        ).toLocaleTimeString("he-IL")}`
                      : "טרם התחיל"}
                  </div>
                  <div>📦 משלוחים: {activeRoute.shipmentOrder.length}</div>
                  <div>💰 סה״כ: {activeRoute.routeTotalPrice?.toFixed(2)} ₪</div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  אין מסלול פעיל – המתן להקצאה
                </p>
              )}
            </CardContent>
          </Card>

          {/* history card */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                🕓 מסלולים אחרונים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto text-sm">
              {routeHistory.length ? (
                routeHistory.map((r) => (
                  <div
                    key={r._id}
                    className="border rounded-lg p-2 hover:bg-gray-50"
                  >
                    <div>📅 {new Date(r.date).toLocaleDateString("he-IL")}</div>
                    <div>📦 {r.shipmentOrder.length} משלוחים</div>
                    <div>💰 {r.routeTotalPrice?.toFixed(2)} ₪</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">לא קיימים מסלולים קודמים</p>
              )}
            </CardContent>
          </Card>
        </div>

        
      </section>
    </main>
  );
}
