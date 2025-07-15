// components/custom/admin/ShipmentCard.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Pencil, Store } from "lucide-react";
import Link from "next/link";
import { getRegionByCity, getRegionLabel, deliveryPrices } from "@/lib/regions";

interface ShipmentCardProps {
  shipmentId: string;
  orderNumber?: number;
  status: string;
  customerName: string;
  phoneNumber: string;
  address: [string, string, string, string]; // [city, location, lng, lat]
  totalPrice: number;
  isPaid: boolean;
  shipmentDetails?: string;
  store?: {
    id: string;
    businessName: string;
    phoneNumber: string;
    address: string;
  };
}

export default function AdminShipmentCard({
  shipmentId,
  orderNumber,
  status,
  customerName,
  phoneNumber,
  address,
  totalPrice,
  isPaid,
  shipmentDetails,
  store,
}: ShipmentCardProps) {
  const [city, location, lng, lat] = address;
  const region = getRegionByCity(city);
  const deliveryPrice = region ? deliveryPrices[region] : 0;
  const netAmount = totalPrice === 0 ? -deliveryPrice : totalPrice - deliveryPrice;

  return (
    <Card
      dir="rtl"
      className="bg-white border border-muted rounded-2xl shadow-lg w-full max-w-4xl mx-auto space-y-6 p-6"
    >
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-lg font-bold">
            {orderNumber ? `הזמנה #${orderNumber}` : "משלוח חדש"}
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              className={`text-xs px-3 py-1 ${isPaid ? "bg-green-500" : "bg-red-500"} text-white`}
            >
              {isPaid ? "שולם" : "לא שולם"}
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1">
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Info Sections */}
      <CardContent className="grid md:grid-cols-3 gap-4">

        {/* 1️⃣ Store Info */}
        <Card className="border border-gray-200 p-4 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="font-semibold mb-2">פרטי חנות</h4>
            {store ? (
              <>
                <p><b>שם:</b> {store.businessName}</p>
                <p><b>כתובת:</b> {store.address || "לא צוינה"}</p>
                <p><b>טלפון:</b> {store.phoneNumber || "לא זמין"}</p>
              </>
            ) : (
              <p className="text-gray-500">אין מידע על חנות</p>
            )}
          </div>
          {store && (
            <div className="mt-4 flex gap-2">
              <a href={`tel:${store.phoneNumber}`} onClick={(e) => e.stopPropagation()}>
                <Button size="icon" variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
              </a>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(store.address)}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="icon" variant="outline">
                  <MapPin className="w-4 h-4" />
                </Button>
              </a>
            </div>
          )}
        </Card>

        {/* 2️⃣ Customer Info */}
        <Card className="border border-gray-200 p-4 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="font-semibold mb-2">פרטי לקוח</h4>
            <p><b>שם:</b> {customerName}</p>
            <p><b>טלפון:</b> {phoneNumber}</p>
            <p><b>כתובת:</b> {location}, {city}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <a href={`tel:${phoneNumber}`} onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="outline">
                <Phone className="w-4 h-4" />
              </Button>
            </a>
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="icon" variant="outline">
                <MapPin className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </Card>

        {/* 3️⃣ Shipment Info */}
        <Card className="border border-gray-200 p-4 shadow-sm">
          <h4 className="font-semibold mb-2">משלוח</h4>
          <p><b>מחיר:</b> ₪{totalPrice}</p>
          <p><b>מחיר משלוח:</b> ₪{deliveryPrice}</p>
          <p><b>סכום נטו:</b> ₪{netAmount}</p>
          {shipmentDetails && (
            <div className="mt-3">
              <p className="font-semibold">פרטים נוספים:</p>
              <p>{shipmentDetails}</p>
            </div>
          )}
        </Card>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
        <Link href={`/admin/shipments/${shipmentId}`}>
          <Button variant="default" className="gap-2">
            <Pencil className="w-4 h-4" /> ערוך משלוח
          </Button>
        </Link>
        {store?.id && (
          <Link href={`/admin/stores/${store.id}`}>
            <Button variant="outline" className="gap-2">
              <Store className="w-4 h-4" /> מעבר לחנות
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
