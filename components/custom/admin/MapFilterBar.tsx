// components/custom/admin/MapFilterBar.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterStoreId: string;
  setFilterStoreId: (val: string) => void;
}

export default function MapFilterBar({
  filterStatus,
  setFilterStatus,
  filterStoreId,
  setFilterStoreId,
}: Props) {
  const [type, setType] = useState("shipments");
  const [stores, setStores] = useState<{ id: string; businessName: string }[]>(
    []
  );

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setStores(data);
      } catch (error) {
        console.error("❌ Failed to load stores:", error);
      }
    };
    fetchStores();
  }, []);

  return (
    <Card className="mb-4 shadow-sm border border-gray-300">
      <CardContent
        className="p-4 flex flex-wrap items-center justify-start gap-6 text-right"
        dir="rtl"
      >
        {/* Entity Type */}
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap">הצג:</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="בחר סוג" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="shipments" value="shipments">
                משלוחים
              </SelectItem>
              <SelectItem key="stores" value="stores">
                חנויות
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shipment Status */}
        {type === "shipments" && (
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">סטטוס:</Label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
              disabled={type !== "shipments"}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">
                  הכל
                </SelectItem>
                <SelectItem key="בהמתנה" value="בהמתנה">
                  בהמתנה
                </SelectItem>
                <SelectItem key="בסניף" value="בסניף">
                  בסניף
                </SelectItem>
                <SelectItem key="במשלוח" value="במשלוח">
                  במשלוח
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Store Filter */}
        {type === "shipments" && (
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">עסק:</Label>
            <Select
              value={filterStoreId}
              onValueChange={setFilterStoreId}
              disabled={type !== "shipments"}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר עסק" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">
                  הכל
                </SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
