// app/admin/routes/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Phone, Map, ArrowDown, ArrowUp } from "lucide-react";

interface StoreDetails {
    phoneNumber: string;
    businessName: string;
    address: [string, string, string?, string?];
}

interface Shipment {
    _id: string;
    orderNumber: number;
    address: [string, string, string?, string?];
    customerName: string;
    phoneNumber: string;
    totalPrice:number;
    shipmentDetails?: string;
    otherDetails?: [string, string];
    store?: StoreDetails;
}

interface Courier {
    _id: string;
    fullName: string;
    clerkId: string;
}

export default function NewRoutePage() {
    const router = useRouter();
    const [date, setDate] = useState("");
    const [courierPhone, setCourierPhone] = useState("");
    const [groupedShipments, setGroupedShipments] = useState<Record<string, Shipment[]>>({});
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [selectedShipments, setSelectedShipments] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shipmentsRes, couriersRes] = await Promise.all([
                    fetch("/api/shipments?withStore=true"),
                    fetch("/api/users?role=courier"),
                ]);

                if (!shipmentsRes.ok || !couriersRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const shipments: Shipment[] = await shipmentsRes.json();
                const couriersData = await couriersRes.json();

                if (!Array.isArray(shipments)) {
                    toast.error("הנתונים שהתקבלו מהשרת אינם תקינים");
                    return;
                }

                const filtered = shipments.filter((s) => ["בהמתנה", "בסניף"].includes(s.otherDetails?.[0] ?? ""));

                const grouped = filtered.reduce((acc, shipment) => {
                    const city = shipment.otherDetails?.[0] === "בהמתנה"
                        ? shipment.store?.address?.[0] || "לא ידוע"
                        : shipment.address?.[0] || "לא ידוע";
                    if (!acc[city]) acc[city] = [];
                    acc[city].push(shipment);
                    return acc;
                }, {} as Record<string, Shipment[]>);

                setGroupedShipments(grouped);
                setCouriers(couriersData);
            } catch (err) {
                console.error("❌ fetch error:", err);
                toast.error("שגיאה בטעינת הנתונים מהשרת");
            }
        };

        fetchData();
    }, []);
const handleSaveRoute = async () => {
  if (!courierPhone || !date) {
    toast.error("אנא בחר שליח ותאריך");
    return;
  }

  if (selectedShipments.size === 0) {
    toast.error("לא נבחרו משלוחים");
    return;
  }

  try {
    const selected: string[] = [];

    Object.values(groupedShipments).forEach((shipments) => {
      shipments.forEach((s) => {
        if (selectedShipments.has(s._id)) {
          selected.push(s._id);
        }
      });
    });

    const allShipments = Object.values(groupedShipments).flat();

    const shipmentOrder = selected.map((id, index) => {
      const found = allShipments.find((s) => s._id === id);
      return {
        shipmentId: id,
        order: index,
        status: found?.otherDetails?.[0] || "בהמתנה",
        notes: "",
      };
    });

    // ✅ Calculate the total route price:
    const routeTotalPrice = selected.reduce((sum, id) => {
      const shipment = allShipments.find((s) => s._id === id);
      return sum + (shipment?.totalPrice || 0);
    }, 0);

    const payload = {
      courierPhone,
      date,
      shipmentOrder,
      routeTotalPrice, // 👈 Include it here
    };

    const res = await fetch("/api/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("שמירת המסלול נכשלה");
    }

    // ✅ Update status of each shipment
    await Promise.all(
      shipmentOrder.map(async (entry) => {
        const current = entry.status;
        let nextStatus = current;

        if (current === "בהמתנה") {
          nextStatus = "נאסף";
        } else if (current === "בסניף") {
          nextStatus = "בדרך ללקוח";
        }

        if (nextStatus !== current) {
          await fetch(`/api/shipments/${entry.shipmentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: nextStatus }),
          });
        }
      })
    );

    toast.success("📦 המסלול נשמר והמשלוחים עודכנו");
    router.push("/admin/routes");
  } catch (err) {
    console.error(err);
    toast.error("שגיאה בשמירת המסלול או בעדכון סטטוס משלוחים");
  }
};



    const toggleShipmentSelection = (shipmentId: string) => {
        setSelectedShipments((prev) => {
            const next = new Set(prev);
            next.has(shipmentId) ? next.delete(shipmentId) : next.add(shipmentId);
            return new Set(next);
        });
    };

    const toggleCitySelection = (city: string) => {
        const shipmentIds = groupedShipments[city].map((s) => s._id);
        setSelectedShipments((prev) => {
            const next = new Set(prev);
            const allSelected = shipmentIds.every((id) => next.has(id));
            shipmentIds.forEach((id) => {
                allSelected ? next.delete(id) : next.add(id);
            });
            return new Set(next);
        });
    };

    const reorderShipment = (city: string, index: number, direction: "up" | "down") => {
        setGroupedShipments((prev) => {
            const list = [...prev[city]];
            if (direction === "up" && index > 0) {
                [list[index - 1], list[index]] = [list[index], list[index - 1]];
            } else if (direction === "down" && index < list.length - 1) {
                [list[index], list[index + 1]] = [list[index + 1], list[index]];
            }
            return { ...prev, [city]: list };
        });
    };

    return (
        <main className="p-6 space-y-6 max-w-full mx-auto" dir="rtl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">יצירת מסלול חדש לשליח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>תאריך</Label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div>
                            <Label>בחר שליח</Label>
                            <select
                                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={courierPhone}
                                onChange={(e) => setCourierPhone(e.target.value)}
                            >
                                <option value="">בחר שליח</option>
                                {couriers.map((courier) => (
                                    <option key={courier._id} value={courier.clerkId}>
                                        {courier.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {Object.entries(groupedShipments).map(([city, shipments]) => (
                        <Card key={city} className="mt-6 border shadow-md w-full">
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle className="text-lg font-semibold flex items-center gap-3">
                                    <input
                                        id={`select-city-${city}`}
                                        type="checkbox"
                                        checked={shipments.every((s) => selectedShipments.has(s._id))}
                                        onChange={() => toggleCitySelection(city)}
                                        className="accent-green-600 w-5 h-5 cursor-pointer"
                                    />
                                    {city}
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/mapbox-map?page=${city}`)}
                                >
                                    <MapPin className="w-4 h-4 mr-1" /> מפה
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {shipments.map((shipment, index) => (
                                        <div key={shipment._id} className="flex items-start gap-4">
                                            <div className="flex flex-col justify-center pt-4 text-gray-500">
                                                <button
                                                    onClick={() => reorderShipment(city, index, "up")}
                                                    className="hover:text-black"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => reorderShipment(city, index, "down")}
                                                    className="hover:text-black"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <ShipmentCard
                                                shipment={shipment}
                                                isSelected={selectedShipments.has(shipment._id)}
                                                toggleSelected={() => toggleShipmentSelection(shipment._id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white mt-6 py-3 text-lg"
                        onClick={handleSaveRoute}
                    >
                        📦 שמור מסלול
                    </Button>

                </CardContent>
            </Card>
        </main>
    );
}

function ShipmentCard({ shipment, isSelected, toggleSelected }: { shipment: Shipment; isSelected: boolean; toggleSelected: () => void }) {
    const status = shipment.otherDetails?.[0];
    const statusColor =
        status === "בהמתנה" ? "bg-yellow-400" : status === "בסניף" ? "bg-blue-400" : "bg-gray-300";

    const isWaiting = status === "בהמתנה";
    const source = isWaiting ? shipment.store : shipment;
    const [city, location, lng, lat] = source?.address || ["", "", "", ""];
    const phone = source?.phoneNumber;
    const name = isWaiting ? (shipment.store as StoreDetails)?.businessName : shipment.customerName;
    const googleMapsUrl = lng && lat ? `https://maps.google.com/?q=${lat},${lng}` : null;

    return (
        <div
            className={`p-4 border rounded-xl shadow bg-white flex items-center gap-4 transition-all duration-200 ${isSelected ? "border-green-500" : "border-gray-300"
                } w-full`}
        >
            <input
                id={`shipment-${shipment._id}`}
                type="checkbox"
                checked={isSelected}
                onChange={toggleSelected}
                className="accent-green-600 w-5 h-5 cursor-pointer"
            />
            <div className="flex flex-col text-right flex-grow">
                <p className="font-semibold text-base">
                    {name} <span className="text-sm text-gray-400">#{shipment.orderNumber}</span>
                </p>
                <p className="text-sm text-gray-500">{location}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            className="text-sm text-white bg-blue-500 px-3 py-1 rounded flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Phone className="w-4 h-4" /> התקשר
                        </a>
                    )}
                    {googleMapsUrl && (
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            className="text-sm text-white bg-green-600 px-3 py-1 rounded flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Map className="w-4 h-4" /> ניווט
                        </a>
                    )}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            alert("הצג פרטי משלוח מלאים (TODO)");
                        }}
                        size="sm"
                        variant="secondary"
                    >
                        הצג משלוח
                    </Button>
                </div>
            </div>
            <span className={`w-3 h-3 rounded-full ${statusColor}`} title={status}></span>
        </div>
    );
}
