"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  stores: { _id: any; businessName: string }[];
  selectedStoreId: string;
  from: Date | null;
  to: Date | null;
}

export default function Filters({ stores, selectedStoreId, from, to }: Props) {
  const router = useRouter();

  // Ensure valid non-empty initial value
  const [storeId, setStoreId] = useState(
    selectedStoreId && selectedStoreId !== "" ? selectedStoreId : "all"
  );

  const [fromDate, setFromDate] = useState(
    from ? formatISO(from, { representation: "date" }) : ""
  );
  const [toDate, setToDate] = useState(
    to ? formatISO(to, { representation: "date" }) : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (storeId !== "all") {
      params.append("storeId", storeId);
    }
    if (fromDate) params.append("from", fromDate);
    if (toDate) params.append("to", toDate);

    router.push(`/admin/payments?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 text-right"
    >
      <Select value={storeId} onValueChange={setStoreId}>
        <SelectTrigger>
          <SelectValue placeholder="בחר חנות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל החנויות</SelectItem>
          {stores
            .filter((s) => s._id && s.businessName)
            .map((store) => {
              const idStr = String(store._id);
              return (
                <SelectItem key={idStr} value={idStr}>
                  {store.businessName}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
      <Input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
      <Button type="submit" className="w-full">
        סנן 🔍
      </Button>
    </form>
  );
}

