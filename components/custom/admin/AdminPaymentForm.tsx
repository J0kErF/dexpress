"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { deliveryPrices, getRegionByCity } from "@/lib/regions";

type Store = {
  _id: string;
  businessName: string;
};

type Shipment = {
  _id: string;
  orderNumber: number;
  totalPrice: number;
  createdAt: string;
  address?: [string, string?, string?, string?];
  otherDetails?: [string?, string?];
  isPaid: boolean;
};

export default function AdminPaymentForm({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("cash");
  const [notes, setNotes] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    if (!storeId) return;

    const fetchUnpaidShipments = async () => {
      const res = await fetch(`/api/shipments/unpaid-by-store/${storeId}`);
      if (!res.ok) {
        toast.error("שגיאה בטעינת ההזמנות");
        return;
      }

      const data: Shipment[] = await res.json();
      if (data.length === 0) toast.warning("אין הזמנות לא משולמות לחנות זו");

      setShipments(data);
      setSelectedOrders([]);
      setAmount("0");
    };

    fetchUnpaidShipments();
  }, [storeId]);

  const getNetPrice = (s: Shipment): number => {
    const city = s.address?.[0] || "לא ידוע";
    const region = getRegionByCity(city);
    const deliveryPrice = region ? deliveryPrices[region] : 0;
    return (s.totalPrice || 0) - deliveryPrice;
  };

  const handleToggleOrder = (shipment: Shipment) => {
    const alreadySelected = selectedOrders.includes(shipment._id);
    const net = getNetPrice(shipment);
    let updatedOrders = [...selectedOrders];
    let newAmount = parseFloat(amount) || 0;

    if (alreadySelected) {
      updatedOrders = updatedOrders.filter((id) => id !== shipment._id);
      newAmount -= net;
    } else {
      updatedOrders.push(shipment._id);
      newAmount += net;
    }

    setSelectedOrders(updatedOrders);
    setAmount(newAmount.toFixed(0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        amount: parseFloat(amount),
        type,
        orders: selectedOrders,
        notes,
        date: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      const data = await res.json();

      data.updatedOrders.forEach((id: string) =>
        toast.success(`הזמנה ${id} סומנה כשולמה ✅`)
      );

      data.failedOrders.forEach((id: string) =>
        toast.error(`שגיאה בעדכון הזמנה ${id} ❌`)
      );

      toast.success("✅ התשלום נוסף בהצלחה");
      router.push("/admin/payments");
    } else {
      toast.error("❌ שגיאה בהוספת התשלום");
    }

  };

  return (
    <Card className="p-6 shadow-lg border max-w-3xl mx-auto space-y-6 text-right rtl">
      <CardHeader>
        <CardTitle className="text-2xl text-right font-bold">💼 הוספת תשלום חדש</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>בחר חנות</Label>
            <Select required onValueChange={setStoreId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר חנות מהרשימה" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store._id} value={store._id}>
                    {store.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {shipments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shipments.map((shipment) => {
                const selected = selectedOrders.includes(shipment._id);
                const net = getNetPrice(shipment);
                const status = shipment.otherDetails?.[0] || "לא ידוע";

                return (
                  <div
                    key={shipment._id}
                    onClick={() => handleToggleOrder(shipment)}
                    className={`rounded-xl p-4 shadow-md text-sm border cursor-pointer transition-all
                    ${selected
                        ? "bg-blue-100 border-blue-600"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className="font-semibold text-blue-900 text-lg mb-1">
                      הזמנה #{shipment.orderNumber}
                    </div>
                    <div>סטטוס: <b>{status}</b></div>
                    <div>סה״כ: ₪{shipment.totalPrice.toFixed(0)}</div>
                    <div>נטו לתשלום: ₪{net.toFixed(0)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(shipment.createdAt), "dd/MM/yyyy")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <Label>סכום לתשלום (₪) — ניתן לערוך</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>סוג תשלום</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר סוג תשלום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">מזומן</SelectItem>
                <SelectItem value="transfer">העברה</SelectItem>
                <SelectItem value="credit">כרטיס אשראי</SelectItem>
                <SelectItem value="check">צ׳ק</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              placeholder="הערות נוספות על התשלום"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 text-lg font-semibold"
            disabled={selectedOrders.length === 0}
          >
            💾 הוסף תשלום
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
