"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ShipmentCard from "@/components/custom/admin/ShipmentCard";

// Fix Leaflet marker icon paths
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

function FitBounds({ markers }: { markers: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => m.coords));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [markers, map]);
  return null;
}

function groupByCoords(data: any[]) {
  const grouped = new Map<string, any[]>();
  for (const { coords, shipment } of data) {
    const key = coords.join(",");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(shipment);
  }
  return Array.from(grouped.entries()).map(([key, shipments]) => {
    const [lat, lng] = key.split(",").map(Number);
    return { coords: [lat, lng], shipments };
  });
}

export default function AdminMapPage() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/map-shipments");
        const enriched = await res.json();

        if (!Array.isArray(enriched)) {
          console.error("Expected array, got:", enriched);
          return;
        }

        const grouped = groupByCoords(
          enriched.map((s: any) => ({
            coords: s.coords,
            shipment: s,
          }))
        );

        setMarkers(grouped);
      } catch (err) {
        console.error("Error fetching map shipments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-screen relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <div className="text-gray-700 text-sm">\u05d8\u05d5\u05e2\u05df \u05d0\u05ea \u05d4\u05de\u05e4\u05d4 \u05d5\u05d4\u05de\u05e9\u05dc\u05d5\u05d7\u05d9\u05dd...</div>
        </div>
      )}

      <MapContainer
        center={[32.0, 35.0]}
        zoom={8}
        scrollWheelZoom
        className="w-full h-full z-0 rounded"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitBounds markers={markers} />
        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.coords}>
            <Popup>
              <div className="text-right space-y-4 w-[250px] max-h-[300px] overflow-y-auto">
                {marker.shipments.map((shipment: any) => (
                  <div
                    key={shipment._id || shipment.orderNumber}
                    className="border-t pt-2 first:border-none first:pt-0"
                  >
                    <div className="text-xs font-semibold">
                      מס\u05b3 \u05d4\u05d6\u05de\u05e0\u05d4: {shipment.orderNumber}
                    </div>
                    <div className="text-xs">\u05dc\u05e7\u05d5\u05d7: {shipment.customerName}</div>
                    <div className="text-xs">
                      \u05e2\u05e1\u05e7: {shipment.store?.businessName || "\u05dc\u05dc\u05d0 \u05de\u05d9\u05d3\u05e2"}
                    </div>
                    <div className="text-xs">
                      \u05e1\u05d8\u05d8\u05d5\u05e1: {shipment.otherDetails?.[0] || "\u05dc\u05d0 \u05d9\u05d3\u05d5\u05e2"}
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${marker.coords[0]},${marker.coords[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs w-full text-center"
                      >
                        \ud83e\udeed \u05e0\u05d9\u05d5\u05d8
                      </a>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="text-xs w-full">\ud83d\udccb \u05de\u05d9\u05d3\u05e2 \u05e0\u05d5\u05e1\u05e3</Button>
                        </DialogTrigger>
                        <DialogContent dir="rtl">
                          <DialogHeader>
                            <DialogTitle>\u05e4\u05e8\u05d8\u05d9 \u05de\u05e9\u05dc\u05d5\u05d7</DialogTitle>
                          </DialogHeader>
                          <ShipmentCard
                            shipmentId={shipment._id}
                            orderNumber={shipment.orderNumber}
                            status={shipment.otherDetails?.[0] || "לא ידוע"}
                            customerName={shipment.customerName}
                            phoneNumber={shipment.phoneNumber}
                            address={
                              Array.isArray(shipment.address)
                                ? shipment.address
                                : ["", "", "", ""]
                            }
                            totalPrice={shipment.totalPrice || 0}
                            isPaid={shipment.isPaid || false}
                            shipmentDetails={shipment.shipmentDetails || ""}
                            store={shipment.store || null}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
