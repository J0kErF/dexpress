"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

interface Store {
  _id: string;
  businessName: string;
  address: string;
  phoneNumber: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setStores(data);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const filteredStores = stores.filter((store) =>
    store.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">רשימת סניפים</h1>
        <div className="w-full sm:w-80">
          <Label htmlFor="search" className="text-sm mb-1 block">חיפוש לפי שם</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="הקלד שם סניף..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => router.push("/admin/stores/add")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          הוסף סניף חדש
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">לא נמצאו סניפים</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredStores.map((store) => (
            <Card
              key={store._id}
              onClick={() => router.push(`/admin/stores/${store._id}`)}
              className="p-4 rounded-xl shadow-sm space-y-2 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition"
            >
              <h2 className="text-lg font-semibold text-yellow-700">{store.businessName}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>כתובת:</strong> {store.address}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>טלפון:</strong> {store.phoneNumber}
              </p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
