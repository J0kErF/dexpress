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
import { Pencil, XCircle } from "lucide-react";
import {
    getRegionByCity,
    getRegionLabel,
    deliveryPrices,
} from "@/lib/regions";

interface ShipmentCardProps {
    orderNumber?: number;
    status: string;
    customerName: string;
    phoneNumber: string;
    address: [string, string, string, string]; // [city, location, lng, lat]
    totalPrice: number;
    isPaid: boolean;
    shipmentDetails?: string;
    onEdit?: () => void;
    onCancel?: () => void;
}

export default function ShipmentCard({
    orderNumber,
    status,
    customerName,
    phoneNumber,
    address,
    totalPrice,
    isPaid,
    shipmentDetails,
    onEdit,
    onCancel,
}: ShipmentCardProps) {
    const city = address?.[0] || "לא ידוע";
    const location = address?.[1] || "לא ידוע";

    const region = getRegionByCity(city);
    const deliveryPrice = region ? deliveryPrices[region] : 0;
    const netAmount = totalPrice === 0 ? -deliveryPrice : totalPrice - deliveryPrice;

    const canEdit = ["בהמתנה", "נאספה"].includes(status);
    const canCancel = ["בהמתנה", "נאספה"].includes(status);

    return (
        <Card dir="rtl" className="bg-white border border-muted rounded-2xl shadow-md w-full">
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle className="text-base font-semibold">
                            {orderNumber ? `הזמנה #${orderNumber}` : "פרטי משלוח"}
                        </CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {status !== "בוטל" && (
                            <>
                                <Badge
                                    variant={
                                        status === "נמסרה"
                                            ? "default"
                                            : status === "בדרך"
                                                ? "secondary"
                                                : "outline"
                                    }
                                    className="text-xs px-3 py-1"
                                >
                                    {status}
                                </Badge>
                                <Badge
                                    className={`text-xs px-3 py-1 ${isPaid ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                        }`}
                                >
                                    {isPaid ? "שולם" : "לא שולם"}
                                </Badge>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-right">
                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                    <p className="font-medium">לקוח:</p>
                    <p>{customerName}</p>

                    <p className="font-medium">טלפון:</p>
                    <p>{phoneNumber}</p>

                    <p className="font-medium">עיר:</p>
                    <p>{city}</p>

                    <p className="font-medium">כתובת:</p>
                    <p>{location}</p>
                </div>

                {shipmentDetails && (
                    <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200 mt-2">
                        <p className="font-medium mb-1">פרטי משלוח:</p>
                        <p>{shipmentDetails}</p>
                    </div>
                )}

                <hr className="my-3 border-muted" />

                <div className="bg-muted p-3 rounded-lg space-y-1 text-center text-sm font-medium">
                    {region && (
                        <p>
                            עלות משלוח ({getRegionLabel(region)}): <b>₪{deliveryPrice}</b>
                        </p>
                    )}
                    <p>
                        סכום כולל: <b>₪{totalPrice}</b>
                    </p>
                    <p>
                        סכום נטו לאחר ניכוי: <b>₪{netAmount}</b>
                    </p>
                </div>
            </CardContent>

            {(canEdit || canCancel) && (
                <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between mt-4">
                    {canEdit && onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="w-full sm:w-auto gap-1"
                        >
                            <Pencil className="w-4 h-4" /> ערוך
                        </Button>
                    )}
                    {canCancel && onCancel && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onCancel}
                            className="w-full sm:w-auto gap-1"
                        >
                            <XCircle className="w-4 h-4" /> בטל משלוח
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
