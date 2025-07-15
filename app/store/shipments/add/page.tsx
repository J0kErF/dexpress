"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CustomerDetailsForm from "@/components/custom/store/CustomerDetailsForm";
import PaymentCard from "@/components/custom/store/PaymentCard";

export default function AddShipmentPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loadingStoreId, setLoadingStoreId] = useState(true);

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    address: ["", "", "", ""], // city, location, lng, lat
    shipmentDetails: "",
    totalPrice: "0",
    isPaid: false,
    otherDetails: ["בהמתנה", "",""], // status, storeId
  });

  // Fetch storeId when Clerk user is loaded
  useEffect(() => {
    const fetchStoreId = async () => {
      if (!isLoaded || !user) return;

      try {
        const res = await fetch(`/api/users/clerk/${user.id}`);
        const data = await res.json();
        if (data?.businessId) {
          setStoreId(data.businessId);
        } else {
          toast.error("לא נמצא מזהה סניף למשתמש זה");
        }
      } catch (error) {
        console.error("Error loading store ID:", error);
        toast.error("שגיאה בעת טעינת מזהה הסניף");
      } finally {
        setLoadingStoreId(false);
      }
    };

    fetchStoreId();
  }, [isLoaded, user]);

  // Update storeId in form.otherDetails reactively
  useEffect(() => {
    if (storeId) {
      setForm((prevForm) => {
        const updatedOtherDetails = [...prevForm.otherDetails];
        updatedOtherDetails[1] = storeId;
        return { ...prevForm, otherDetails: updatedOtherDetails };
      });
    }
  }, [storeId]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (index: number, value: string) => {
    const updated = [...form.address];
    updated[index] = value;
    setForm((prev) => ({ ...prev, address: updated }));
  };

  const handleSubmit = async () => {
    if (!storeId) {
      toast.error("לא ניתן לשמור משלוח לפני טעינת מזהה הסניף");
      return;
    }

    const payload = {
      ...form,
      totalPrice: form.totalPrice ? parseFloat(form.totalPrice) : 0,
    };

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();

        toast.success("📦 המשלוח נוסף בהצלחה", {
          description: "תוכל לראות את המשלוח ברשימה.",
          duration: 4000,
          action: {
            label: "מעבר לרשימה",
            onClick: () => router.push(`/store/shipments/${data._id}`),
          },
          className: "text-right",
        });
      } else {
        toast.error("❌ שמירת המשלוח נכשלה", {
          description: "נסה שוב או בדוק את החיבור.",
          duration: 4000,
          className: "text-right",
        });
      }
    } catch (error) {
      console.error("Error submitting shipment:", error);
      toast.error("שגיאה בעת שליחת המשלוח");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4" dir="rtl">
      <h1 className="text-xl font-bold mb-2">הוסף משלוח חדש</h1>

      <CustomerDetailsForm
        customerName={form.customerName}
        phoneNumber={form.phoneNumber}
        city={form.address[0]}
        location={form.address[1]}
        onChange={(field, value) => {
          if (field.startsWith("address.")) {
            const index = parseInt(field.split(".")[1]);
            handleAddressChange(index, value);
          } else {
            handleChange(field, value);
          }
        }}
      />

      <Card dir="rtl" className="shadow-sm border-muted bg-background text-foreground">
        <CardHeader>
          <CardTitle className="text-right text-lg font-semibold">
            פרטי המשלוח והערות
          </CardTitle>
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

      <PaymentCard
        totalPrice={form.totalPrice}
        city={form.address[0]}
        onChange={(field, value) => handleChange(field, value)}
      />

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={loadingStoreId || !storeId}
      >
        שמור משלוח
      </Button>
    </div>
  );
}
