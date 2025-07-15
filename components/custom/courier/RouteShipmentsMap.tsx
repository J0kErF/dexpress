// components/custom/courier/RouteShipmentsMap.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface ShipmentOrderEntry {
  shipmentId: {
    _id: string;
    orderNumber: number;
    customerName: string;
    phoneNumber: string;
    address: (string | number)[]; // [city, location, lng, lat]
    totalPrice?: number;
    otherDetails?: string[];
  };
  status: string;
}

export default function RouteShipmentsMap({
  shipmentOrder,
}: {
  shipmentOrder: ShipmentOrderEntry[];
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    /* init map */
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [35, 32], // default center (IL)
      zoom: 8,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    /* add pins */
    shipmentOrder.forEach((o) => {
      const adr = o.shipmentId.address;
      const lng = Number(adr[2]);
      const lat = Number(adr[3]);
      if (isNaN(lng) || isNaN(lat)) return; // skip if no coords

      new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setHTML(
            `<div style="direction:rtl">
              <strong>הזמנה #${o.shipmentId.orderNumber}</strong><br/>
              ${o.shipmentId.customerName}<br/>
              ${adr[1] ?? ""} ${adr[0] ?? ""}<br/>
              סטטוס: ${o.status}
            </div>`
          )
        )
        .addTo(map);
    });

    /* fit bounds if we have at least 2 נקודות */
    const coords = shipmentOrder
      .map((o) => [Number(o.shipmentId.address[2]), Number(o.shipmentId.address[3])])
      .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));

    if (coords.length === 1) {
      map.setCenter(coords[0] as [number, number]);
      map.setZoom(12);
    } else if (coords.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach((c) => bounds.extend(c as [number, number]));
      map.fitBounds(bounds, { padding: 60 });
    }

    return () => map.remove();
  }, [shipmentOrder]);

  return <div ref={mapRef} className="w-full h-[450px] rounded-lg" />;
}
