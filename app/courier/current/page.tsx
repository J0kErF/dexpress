// app/courier/current/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

/* ---------- Types ---------- */
interface Shipment {
  _id: string;
  orderNumber: number;
  customerName: string;
  phoneNumber: string;
  address: string[];
  totalPrice: number;
  otherDetails?: string[]; // [status, storeId, lng, lat]
  store?: { businessName: string; phoneNumber: string; address: string[] };
}
interface Route {
  _id: string;
  date: string;
  startTime?: string;
  finishTime?: string;
  routeTotalPrice?: number;
  shipmentOrder: { shipmentId: Shipment; status: string; notes?: string }[];
}

/* ---------- Component ---------- */
export default function CourierCurrentPage() {
  const { user, isLoaded } = useUser();

  const [route, setRoute] = useState<Route | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [saving, setSaving] = useState(false);

  /* fetch active route */
  useEffect(() => {
    if (!isLoaded || !user) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/routes/my-active/${user.id}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        setRoute(data.active ?? null);
      } catch {
        toast.error("שגיאה בטעינת המסלול הנוכחי");
      }
    })();
  }, [isLoaded, user]);

  /* start / finish route action */
  const handleRouteAction = async () => {
    if (!route) return;
    setSaving(true);
    const nowIso = new Date().toISOString();
    const body =
      !route.startTime
        ? { startTime: nowIso }
        : route.startTime && !route.finishTime
        ? { finishTime: nowIso }
        : null;
    if (!body) return;

    try {
      const res = await fetch(`/api/routes/${route._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setRoute({ ...route, ...body });
      toast.success(body.startTime ? "מסלול התחיל!" : "מסלול הסתיים!");
    } catch {
      toast.error("פעולה נכשלה");
    } finally {
      setSaving(false);
    }
  };

  /* badge color map */
  const badgeClass = (st?: string) =>
    ({
      בהמתנה: "bg-yellow-400 text-black",
      בסניף: "bg-blue-500 text-white",
      "בדרך ללקוח": "bg-purple-500 text-white",
      "בדרך לסניף": "bg-orange-600 text-white",
      נמסר: "bg-green-600 text-white",
    }[st as keyof typeof badgeClass] ?? "bg-gray-300 text-black");

  /* translate raw status to label */
  const renderStatus = (raw?: string) =>
    raw === "נאסף"
      ? "איסוף"
      : raw === "בדרך ללקוח"
      ? "מסירה"
      : raw ?? "לא ידוע";

  /* loading / no-route states */
  if (!isLoaded)
    return (
      <main className="p-4 flex items-center justify-center h-full text-gray-400">
        טוען...
      </main>
    );
  if (!route)
    return (
      <main className="p-4 flex items-center justify-center h-full text-gray-500">
        אין לך מסלול פעיל כרגע
      </main>
    );

  const showStart = !route.startTime;
  const showFinish = route.startTime && !route.finishTime;

  return (
    <main dir="rtl" className="p-4 sm:p-6 space-y-4 pb-20">
      {/* summary card */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex justify-between items-center">
            <span>🚚 המסלול של היום</span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary flex items-center gap-1 text-sm"
            >
              {expanded ? "הסתר" : "הצג"} משלוחים
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <div>
            📅 {new Date(route.date).toLocaleDateString("he-IL")} | ⏱️{" "}
            {route.startTime
              ? `התחיל: ${new Date(route.startTime).toLocaleTimeString("he-IL")}`
              : "טרם התחיל"}
            {route.finishTime &&
              ` | ✅ סיום: ${new Date(
                route.finishTime
              ).toLocaleTimeString("he-IL")}`}
          </div>
          <div>📦 משלוחים: {route.shipmentOrder.length}</div>
          <div>💰 סה״כ: {route.routeTotalPrice?.toFixed(2) ?? "0.00"} ₪</div>

          {showStart && (
            <Button
              disabled={saving}
              onClick={handleRouteAction}
              className="mt-2 w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              התחלת מסלול
            </Button>
          )}
          {showFinish && (
            <Button
              disabled={saving}
              onClick={handleRouteAction}
              className="mt-2 w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              סיום מסלול
            </Button>
          )}
        </CardContent>
      </Card>

      {/* shipment list */}
      {expanded && (
        <div className="space-y-3">
          {route.shipmentOrder.map((o) => {
            const s  = o.shipmentId;
            const st = s.otherDetails?.[0] ?? "לא ידוע";

            const lng = s.otherDetails?.[2];
            const lat = s.otherDetails?.[3];
            const hasCoords = lng && lat;
            const wazeUrl =
              hasCoords
                ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
                : null;

            const isPickup   = st === "נאסף";
            const isDelivery = st === "בדרך ללקוח";

            /* next status & button label */
            const nextStatus = isPickup
              ? "בדרך לסניף"
              : isDelivery
              ? "נמסר"
              : null;
            const btnLabel = isPickup ? "סמן איסוף" : isDelivery ? "סמן מסירה" : "";

            /* mark done */
            const markDone = async () => {
              if (!nextStatus) return;
              try {
                await fetch(`/api/shipments/${s._id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: nextStatus }),
                });
                s.otherDetails![0] = nextStatus; // optimistic
                toast.success("עודכן!");
                setRoute({ ...route });
              } catch {
                toast.error("עדכון נכשל");
              }
            };

            return (
              <Card key={s._id} className="shadow-sm">
                <CardContent className="py-4 space-y-3 text-sm">
                  {/* row 1 */}
                  <div className="flex justify-between items-center font-semibold">
                    <span>הזמנה #{s.orderNumber}</span>
                    {isDelivery && s.totalPrice && (
                      <span className="text-green-700">{s.totalPrice} ₪</span>
                    )}
                  </div>

                  {/* row 2 */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 rtl">
                      {isPickup
                        ? `מ־ ${s.store?.businessName}`
                        : `מ־ ${s.store?.businessName} → ${s.customerName}`}
                      <br />
                      <span className="text-gray-600 text-xs">
                        {isPickup
                          ? s.store?.address?.join(" ")
                          : s.address?.join(" ")}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${badgeClass(st)}`}
                    >
                      {renderStatus(st)}
                    </span>
                  </div>

                  {/* row 3 */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {s.store?.phoneNumber && (
                      <a
                        href={`tel:${s.store.phoneNumber}`}
                        className="bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300"
                      >
                        📞 חנות
                      </a>
                    )}
                    {s.phoneNumber && (
                      <a
                        href={`tel:${s.phoneNumber}`}
                        className="bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300"
                      >
                        📞 לקוח
                      </a>
                    )}
                    {hasCoords && (
                      <>
                        <a
                          href={wazeUrl!}
                          target="_blank"
                          className="bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600"
                        >
                          🗺️ Waze
                        </a>
                        <a
                          href={`https://maps.google.com/?q=${lat},${lng}`}
                          target="_blank"
                          className="bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
                        >
                          📍 מפה
                        </a>
                      </>
                    )}
                  </div>

                  {/* row 4 */}
                  {nextStatus && (
                    <Button
                      size="sm"
                      onClick={markDone}
                      className={`w-full ${
                        isPickup
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {btnLabel}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
