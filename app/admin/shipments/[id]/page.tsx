// app/shipments/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CustomerDetailsForm from "@/components/custom/store/CustomerDetailsForm";
import PaymentCard from "@/components/custom/store/PaymentCard";
import { toast } from "sonner";

/* status options used in dropdown */
const statusOptions = [
  "בהמתנה",
  "בסניף",
  "נאסף",
  "בדרך ללקוח",
  "בדרך לסניף",
  "נמסר",
  "בוטל",
];

export default function EditShipmentPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(true);

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    address: ["", "", "", ""], // city, location, lng, lat
    shipmentDetails: "",
    totalPrice: "0",
    isPaid: false,
    otherDetails: ["בהמתנה", id?.toString() || ""], // [status, storeId, ...]
  });

  /* ---------- helpers ---------- */
  const handleChange = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAddressChange = (idx: number, val: string) => {
    const updated = [...form.address];
    // store lng / lat as numbers (or empty)
    if (idx === 2 || idx === 3) updated[idx] = val ? Number(val) : "" as any;
    else updated[idx] = val;
    setForm((p) => ({ ...p, address: updated }));
  };

  /* ---------- fetch shipment on mount ---------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/shipments/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();

        setForm({
          customerName: data.customerName || "",
          phoneNumber:  data.phoneNumber || "",
          address:      Array.isArray(data.address) ? data.address : ["", "", "", ""],
          shipmentDetails: data.shipmentDetails || "",
          totalPrice:   data.totalPrice?.toString() || "0",
          isPaid:       data.isPaid || false,
          otherDetails: data.otherDetails || ["בהמתנה", id.toString()],
        });
      } catch {
        toast.error("שגיאה בטעינת נתוני המשלוח");
        router.push("/shipments");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- save ---------- */
  const handleSubmit = async () => {
    // validate coordinates
    const [, , lng, lat] = form.address;
    const coordErr =
      ((lng && isNaN(Number(lng))) || (lat && isNaN(Number(lat)))) ||
      ((lng && !lat) || (!lng && lat));
    if (coordErr) {
      toast.error("יש להזין גם קו אורך וגם קו רוחב כמספרים או להשאיר שניהם ריקים");
      return;
    }

    const payload = {
      ...form,
      totalPrice: form.totalPrice ? parseFloat(form.totalPrice) : undefined,
    };

    const res = await fetch(`/api/shipments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("📦 המשלוח עודכן בהצלחה", {
        duration: 4000,
        className: "text-right",
        action: {
          label: "מעבר לרשימה",
          onClick: () => router.push("/store/shipments"),
        },
      });
    } else {
      toast.error("❌ העדכון נכשל", { className: "text-right" });
    }
  };

  if (isLoading) return <p className="text-center mt-10">טוען נתונים...</p>;

  /* ---------- UI ---------- */
  return (
    <div className="max-w-xl mx-auto p-4 space-y-4" dir="rtl">
      <h1 className="text-xl font-bold mb-2">ערוך משלוח</h1>

      {/* customer */}
      <CustomerDetailsForm
        customerName={form.customerName}
        phoneNumber={form.phoneNumber}
        city={form.address[0]}
        location={form.address[1]}
        onChange={(field, value) => {
          if (field.startsWith("address.")) {
            const idx = Number(field.split(".")[1]);
            handleAddressChange(idx, value);
          } else handleChange(field, value);
        }}
      />

      {/* coordinates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">קואורדינטות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="קו אורך (Longitude)"
            value={form.address[2] || ""}
            onChange={(e) => handleAddressChange(2, e.target.value)}
          />
          <Input
            placeholder="קו רוחב (Latitude)"
            value={form.address[3] || ""}
            onChange={(e) => handleAddressChange(3, e.target.value)}
          />
        </CardContent>
      </Card>

      {/* status dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">סטטוס משלוח</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={form.otherDetails[0]}
            onChange={(e) => {
              const arr = [...form.otherDetails];
              arr[0] = e.target.value;
              setForm((p) => ({ ...p, otherDetails: arr }));
            }}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-right"
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* details / notes */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-right">פרטי המשלוח והערות</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="פרטי המשלוח"
            value={form.shipmentDetails}
            onChange={(e) => handleChange("shipmentDetails", e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* payment */}
      <PaymentCard
        totalPrice={form.totalPrice}
        city={form.address[0]}
        onChange={(field, val) => handleChange(field, val)}
      />

      <Button className="w-full" onClick={handleSubmit}>
        עדכן משלוח
      </Button>
    </div>
  );
}
