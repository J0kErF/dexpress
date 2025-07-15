"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ShipmentCard from "@/components/custom/store/ShipmentCard";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(false);

      const userId = user.id;
      const shipmentId = searchParams.get("id");

      if (shipmentId) {
        const res = await fetch(`/api/shipments/${shipmentId}`);
        const data = await res.json();
        setShipments(data ? [data] : []);
      } else {
        const res = await fetch(`/api/shipments/store/${userId}`);
        const data = await res.json();
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setShipments(data);
      }
    } catch (err) {
      console.error("Error loading shipments:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    const statusParam = searchParams.get("status");
    if (statusParam) setStatusFilter(statusParam);
    fetchShipments();
  }, [isLoaded, user, searchParams]);

  useEffect(() => {
    let result = [...shipments];
    if (statusFilter !== "all") {
      result = result.filter((s: any) => s.otherDetails?.[0] === statusFilter);
    }
    if (paymentFilter !== "all") {
      const isPaid = paymentFilter === "paid";
      result = result.filter((s: any) => s.isPaid === isPaid);
    }
    setFiltered(result);
  }, [statusFilter, paymentFilter, shipments]);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherDetails: ["בוטל"] }),
      });
      if (res.ok) {
        await fetchShipments();
      } else {
        console.error("Failed to cancel shipment");
      }
    } catch (error) {
      console.error("Cancel error:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">כל המשלוחים</h1>

      {/* Filters */}
      {!searchParams.get("id") && (
        <div className="flex flex-wrap gap-4 w-full max-w-3xl">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              router.replace(`/store/shipments?status=${encodeURIComponent(e.target.value)}`);
            }}
            className="p-2 rounded border border-gray-300 text-sm"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="בהמתנה">בהמתנה</option>
            <option value="בסניף">בסניף</option>
            <option value="במשלוח">במשלוח</option>
            <option value="נמסר">נמסר</option>
            <option value="החזרות">החזרות</option>
            <option value="בוטל">בוטל</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="p-2 rounded border border-gray-300 text-sm"
          >
            <option value="all">כל התשלומים</option>
            <option value="paid">שולם</option>
            <option value="unpaid">לא שולם</option>
          </select>
        </div>
      )}

      {/* Loading, Error or Shipment List */}
      <div className="w-full max-w-3xl space-y-4 mt-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))
        ) : error ? (
          <p className="text-center text-red-500">שגיאה בטעינת המשלוחים.</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">אין משלוחים להצגה</p>
        ) : (
          filtered.map((shipment: any) => (
            <ShipmentCard
              key={shipment._id}
              orderNumber={shipment.orderNumber || undefined}
              status={shipment.otherDetails?.[0] || "לא ידוע"}
              customerName={shipment.customerName}
              phoneNumber={shipment.phoneNumber}
              address={Array.isArray(shipment.address) ? shipment.address : ["", "", "", ""]}
              totalPrice={shipment.totalPrice || 0}
              isPaid={shipment.isPaid || false}
              shipmentDetails={shipment.shipmentDetails || ""}
              onEdit={() => router.push(`/store/shipments/${shipment._id}`)}
              onCancel={() => handleCancel(shipment._id)}
            />
          ))
        )}
      </div>
    </main>
  );
}
