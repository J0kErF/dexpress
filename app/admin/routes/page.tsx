"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react";

interface Store {
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
    otherDetails?: string[];
    store?: Store;
}

interface ShipmentOrderEntry {
    shipmentId: Shipment;
    order: number;
    status: string;
    notes?: string;
}

interface Route {
    _id: string;
    courierPhone: string;
    date: string;
    startTime?: string;
    finishTime?: string;
    createdAt?: string;
    routeTotalPrice?: number;
    shipmentOrder: ShipmentOrderEntry[];
    courier?: { fullName: string; phoneNumber: string };
}

export default function AdminRoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [expandedRouteIds, setExpandedRouteIds] = useState<Set<string>>(new Set());
    const router = useRouter();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const res = await fetch("/api/routes");
                if (!res.ok) throw new Error();
                const data = await res.json();

                const routesWithCouriers = await Promise.all(
                    data.map(async (route: Route) => {
                        const userRes = await fetch(`/api/users/clerk/${route.courierPhone}`);
                        const userData = await userRes.ok ? await userRes.json() : null;
                        return {
                            ...route,
                            courier: userData || { fullName: "שם לא ידוע", phoneNumber: "" },
                        };
                    })
                );

                setRoutes(routesWithCouriers);
            } catch (err) {
                toast.error("שגיאה בטעינת המסלולים");
            }
        };

        fetchRoutes();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedRouteIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const getStatusLabel = (status: string) => {
        if (status === "בהמתנה") return { label: "לאסוף", color: "bg-yellow-400 text-black" };
        if (status === "בסניף") return { label: "למסור", color: "bg-blue-500 text-white" };
        return { label: status, color: "bg-gray-300 text-black" };
    };
    const getRouteStatus = (route: Route) => {
        if (route.finishTime) return { label: "✅ הסתיים", color: "text-green-600" };
        if (route.startTime) return { label: "🚚 בתהליך", color: "text-blue-600" };
        return { label: "⏳ לא התחיל", color: "text-yellow-600" };
    };

    return (
        <main className="p-6 space-y-6 max-w-6xl mx-auto" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">📦 מסלולים קיימים</h1>
                <Button
                    className="flex gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => router.push("/admin/routes/new")}
                >
                    <PlusCircle className="w-5 h-5" />
                    יצירת מסלול חדש
                </Button>
            </div>

            {routes.length === 0 && <p className="text-gray-500">לא קיימים מסלולים</p>}

            {routes.map((route) => {
                const isExpanded = expandedRouteIds.has(route._id);

                return (
                    <Card key={route._id} className="border shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden">
                        <CardHeader
                            className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition px-6 py-4"
                            onClick={() => toggleExpand(route._id)}
                        >
                            <CardTitle className="flex justify-between items-start text-lg font-semibold text-gray-800">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        📞 שליח: {route.courier?.fullName ?? "לא ידוע"}
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full border font-medium ${getRouteStatus(route).color} border-current`}
                                        >
                                            {getRouteStatus(route).label}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                        <div>📅 תאריך: {new Date(route.date).toLocaleDateString("he-IL")}</div>
                                        <div>📦 משלוחים: {route.shipmentOrder.length}</div>
                                        <div>🕓 נוצר: {new Date(route.createdAt ?? route.date).toLocaleString("he-IL")}</div>
                                        <div>
                                            ⏱️ {route.startTime ? `התחלה: ${new Date(route.startTime).toLocaleTimeString("he-IL")}` : "עדיין לא התחיל"}
                                        </div>
                                        <div>
                                            {route.finishTime && `✅ סיום: ${new Date(route.finishTime).toLocaleTimeString("he-IL")}`}
                                        </div>
                                        <div>💰 סה״כ: {route.routeTotalPrice?.toFixed(2) ?? "0.00"} ₪</div>
                                    </div>
                                </div>
                                <div className="pt-1">{isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
                            </CardTitle>
                        </CardHeader>

                        {isExpanded && (
                            <CardContent className="bg-white px-6 py-4 divide-y space-y-4">
                                {route.shipmentOrder.map((entry) => {
                                    const shipment = entry.shipmentId;
                                    const status = shipment.otherDetails?.[0] ?? "לא ידוע";
                                    const price = shipment.totalPrice;
                                    const isPickup = status === "בהמתנה";
                                    const badge = getStatusLabel(status);

                                    return (
                                        <div
                                            key={shipment._id}
                                            className="pt-4 cursor-pointer hover:bg-gray-50 rounded-lg transition p-2"
                                            onClick={() => router.push(`/admin/shipments/${shipment._id}`)}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-base font-semibold text-gray-800">
                                                    {isPickup
                                                        ? shipment.store?.businessName
                                                        : `${shipment.store?.businessName} ל- ${shipment.customerName}`}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-1">
                                                {isPickup ? (
                                                    <>
                                                        <div>{shipment.store?.address?.join(" ")}</div>
                                                        {shipment.store?.phoneNumber && (
                                                            <div>📞 {shipment.store.phoneNumber}</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div>{shipment.address?.join(" ")}</div>
                                                        {shipment.phoneNumber && (
                                                            <div>📞 {shipment.phoneNumber}</div>
                                                        )}
                                                    </>
                                                )}
                                                <div>מספר הזמנה: #{shipment.orderNumber}</div>
                                                {price && (
                                                    <div className="text-green-700 font-medium">💰 מחיר: {price} ₪</div>
                                                )}
                                                {entry.notes && (
                                                    <div className="text-xs text-gray-400 italic">הערות: {entry.notes}</div>
                                                )}
                                            </div>
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
