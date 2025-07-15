// app/shipments/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CustomerDetailsForm from "@/components/custom/store/CustomerDetailsForm";
import PaymentCard from "@/components/custom/store/PaymentCard";
import { deliveryPrices, getRegionByCity } from "@/lib/regions";
import { toast } from "sonner";

export default function EditShipmentPage() {
    const router = useRouter();
    const { id } = useParams(); // get ID from URL
    const [isLoading, setIsLoading] = useState(true);

    const [form, setForm] = useState({
        customerName: "",
        phoneNumber: "",
        address: ["", "", "", ""], // city, location, lng, lat
        shipmentDetails: "",
        totalPrice: "0",
        isPaid: false,
        otherDetails: ["בהמתנה", id?.toString() || ""],
    });

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

    // 🟡 Fetch existing shipment data
    useEffect(() => {
        const fetchShipment = async () => {
            if (!id) return;
            try {
                const res = await fetch(`/api/shipments/${id}`, {
                    cache: "no-store",
                }); if (!res.ok) throw new Error("Failed to fetch shipment");
                const data = await res.json();

                setForm({
                    customerName: data.customerName || "",
                    phoneNumber: data.phoneNumber || "",
                    address: Array.isArray(data.address) ? data.address : ["", "", "", ""],
                    shipmentDetails: data.shipmentDetails || "",
                    totalPrice: data.totalPrice?.toString() || "0",
                    isPaid: data.isPaid || false,
                    otherDetails: data.otherDetails || ["בהמתנה", id.toString()],
                });
            } catch (err) {
                toast.error("שגיאה בטעינת נתוני המשלוח");
                router.push("/shipments");
            } finally {
                setIsLoading(false);
            }
        };

        fetchShipment();
    }, [id]);

    // 🟡 Update totalPrice based on city if user changes it
    

    const handleSubmit = async () => {
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
                description: "השינויים נשמרו בהצלחה.",
                duration: 4000,
                className: "text-right",
                action: {
                    label: "מעבר לרשימה",
                    onClick: () => router.push("/store/shipments"),
                },
            });
        } else {
            toast.error("❌ העדכון נכשל", {
                description: "נסה שוב או בדוק את החיבור.",
                className: "text-right",
            });
        }
    };

    if (isLoading) return <p className="text-center mt-10">טוען נתונים...</p>;

    return (
        <div className="max-w-xl mx-auto p-4 space-y-4" dir="rtl">
            <h1 className="text-xl font-bold mb-2">ערוך משלוח</h1>

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

            <Button className="w-full" onClick={handleSubmit}>
                עדכן משלוח
            </Button>
        </div>
    );
}
