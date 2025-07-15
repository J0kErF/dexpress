"use client";

import { JSX, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, AlertCircle, Warehouse, LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

type Shipment = {
  _id: string;
  orderNumber: string;
  customerName: string;
  coords?: [number, number];
  otherDetails: string[];
};

type Summary = {
  waitWithCoords: number;
  waitWithoutCoords: number;
  storeWithCoords: number;
  storeWithoutCoords: number;
};

export default function MapboxShipments() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch("/api/map-shipments");
        const data = await res.json();
        setShipments(data.shipments);
        setSummary(data.summary);
      } catch (err) {
        console.error("❌ Failed to fetch shipments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  useEffect(() => {
    if (!mapRef.current || shipments.length === 0) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [35.0, 32.0],
      zoom: 8,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const valid = shipments.filter((s) => s.coords);
    const missing = shipments.filter((s) => !s.coords);

    valid.forEach((s) => {
      const [lat, lng] = s.coords!;
      new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="direction: rtl">
              <strong>מס׳ הזמנה:</strong> ${s.orderNumber}<br />
              <strong>לקוח:</strong> ${s.customerName}
            </div>
          `)
        )
        .addTo(map);
    });

    if (missing.length > 0) {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([35.0, 32.0])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="direction: rtl; color: red">
              ❗ ${missing.length} משלוחים ללא מיקום
            </div>
          `)
        )
        .addTo(map);
    }

    return () => map.remove();
  }, [shipments]);

  const StatCard = ({
    icon,
    title,
    count,
    query,
  }: {
    icon: JSX.Element;
    title: string;
    count: number;
    query: string;
  }) => (
    <div
      onClick={() => router.push(`/admin/shipments?${query}`)}
      className="flex flex-col items-center justify-center gap-2 bg-white border rounded-xl shadow p-4 transition hover:bg-gray-100 w-full cursor-pointer text-center"
    >
      <div className="flex items-center justify-center bg-blue-100 rounded-full w-12 h-12">
        {icon}
      </div>
      <div className="text-xl font-bold">{count}</div>
      <div className="text-sm text-gray-600 whitespace-pre-line leading-tight">{title}</div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/80 text-sm">
          טוען משלוחים...
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 rtl text-right">
          <StatCard
            icon={<MapPin className="text-blue-600 w-5 h-5" />}
            title={"ממתינים\nעם מיקום"}
            count={summary.waitWithCoords}
            query="status=בהמתנה&hasCoords=true"
          />
          <StatCard
            icon={<AlertCircle className="text-red-600 w-5 h-5" />}
            title={"ממתינים\nבלי מיקום"}
            count={summary.waitWithoutCoords}
            query="status=בהמתנה&hasCoords=false"
          />
          <StatCard
            icon={<Warehouse className="text-green-600 w-5 h-5" />}
            title={"בסניף\nעם מיקום"}
            count={summary.storeWithCoords}
            query="status=בסניף&hasCoords=true"
          />
          <StatCard
            icon={<LocateFixed className="text-yellow-600 w-5 h-5" />}
            title={"בסניף\nבלי מיקום"}
            count={summary.storeWithoutCoords}
            query="status=בסניף&hasCoords=false"
          />
        </div>
      )}

      {/* Map Display */}
      <div className="flex-1 w-full">
        <div ref={mapRef} className="w-full h-full rounded" />
      </div>
    </div>
  );
}
