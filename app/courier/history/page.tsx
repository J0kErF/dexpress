// app/courier/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

/* ---------- Types ---------- */
interface StoreLite {
  businessName: string;
  phoneNumber: string;
  address: string[];
}
interface Shipment {
  _id: string;
  orderNumber: number;
  customerName: string;
  phoneNumber: string;
  address: string[];
  totalPrice: number;
  otherDetails?: string[]; // [status, storeId, …]
  store?: StoreLite;
}
interface ShipmentOrderEntry {
  shipmentId: Shipment;
  status: string;
  notes?: string;
}
interface Route {
  _id: string;
  date: string;
  startTime?: string;
  finishTime?: string;
  routeTotalPrice?: number;
  shipmentOrder: ShipmentOrderEntry[];
}

/* ---------- Badge helper ---------- */
const badge = (st?: string) =>
  ({
    בהמתנה: "bg-yellow-400 text-black",
    בסניף: "bg-blue-500 text-white",
    "בדרך ללקוח": "bg-purple-500 text-white",
    "בדרך לסניף": "bg-orange-600 text-white",
    נמסר: "bg-green-600 text-white",
  }[st as keyof typeof badge] ?? "bg-gray-300 text-black");

/* ---------- Component ---------- */
export default function CourierHistoryPage() {
  const { user, isLoaded } = useUser();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /* fetch history once Clerk loaded */
  useEffect(() => {
    if (!isLoaded || !user) return;

    (async () => {
      try {
        const res = await fetch(`/api/routes/my-active/${user.id}?history=1`, {
          cache: "no-store",
        });
        const data = await res.json();
        console.log("Fetched routes:", data.history || ["error fetching history"]);
        setRoutes(data.history || []);
      } catch {
        toast.error("שגיאה בטעינת היסטוריית המסלולים");
      }
    })();
  }, [isLoaded, user]);

  if (!isLoaded)
    return (
      <main className="flex items-center justify-center h-full p-4 text-gray-400">
        טוען...
      </main>
    );

  return (
    <main dir="rtl" className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-20">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        🕓 היסטוריית מסלולים
      </h1>

      {routes.length === 0 && (
        <p className="text-gray-500">לא נמצאו מסלולים קודמים</p>
      )}

      {routes.map((route) => {
        const isOpen = expanded.has(route._id);
        const toggle = () =>
          setExpanded((prev) => {
            const next = new Set(prev);
            next.has(route._id) ? next.delete(route._id) : next.add(route._id);
            return next;
          });

        return (
          <Card key={route._id} className="border shadow-sm">
            <CardHeader
              onClick={toggle}
              className="cursor-pointer hover:bg-gray-50 flex justify-between items-start"
            >
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {new Date(route.date).toLocaleDateString("he-IL")}
                  {route.routeTotalPrice && (
                    <span className="text-sm text-green-700 ms-2">
                      ‎{route.routeTotalPrice.toFixed(2)} ₪
                    </span>
                  )}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  משלוחים: {route.shipmentOrder.length}
                </div>
                {route.startTime && route.finishTime && (
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(route.startTime).toLocaleTimeString("he-IL")}–‎
                    {new Date(route.finishTime).toLocaleTimeString("he-IL")}
                  </div>
                )}
              </div>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>

            {isOpen && (
              <CardContent className="bg-gray-50 space-y-3">
                {route.shipmentOrder.map((o) => {
                  const s = o.shipmentId;
                  const st = s.otherDetails?.[0] ?? "לא ידוע";
                  const isPickup = st === "נאסף";

                  return (
                    <div
                      key={s._id}
                      className="bg-white border rounded-lg p-3 flex justify-between items-start"
                    >
                      <div className="text-sm">
                        <div className="font-medium">
                          {isPickup
                            ? s.store?.businessName
                            : `${s.store?.businessName} → ${s.customerName}`}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {isPickup
                            ? s.store?.address?.join(" ")
                            : s.address?.join(" ")}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          הזמנה #{s.orderNumber}
                        </div>
                        {s.totalPrice && (
                          <div className="text-green-700 text-xs font-semibold">
                            {s.totalPrice} ₪
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${badge(
                          st
                        )}`}
                      >
                        {st}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}
    </main>
  );
}
