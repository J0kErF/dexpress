"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/custom/store/StatsCard";
import { deliveryPrices, getRegionByCity } from "@/lib/regions";
import { useUser } from "@clerk/nextjs";

import {
    Wallet,
    Clock,
    Package,
    Truck,
    Check,
    Undo,
    X,
} from "lucide-react";

export default function HomePage() {
    const [shipments, setShipments] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const { user, isLoaded } = useUser();
    const fetchData = async () => {
        try {
            if (!user) return;
            const userId = user.id;

            const userDataResponse = await fetch(`/api/users/clerk/${userId}`, {
                cache: "no-store", // Ensure fresh data
            });
            const userData = await userDataResponse.json();

            const businessId = userData?.businessId;

            const paymentRes = await fetch(`/api/payments/store/${businessId}`);

            const paymentData = await paymentRes.json();
            setPayments(paymentData);
            const res = await fetch(`/api/shipments/store/${userId}`, {
                cache: "no-store", // Ensure fresh data
            });
            const data = await res.json();
            setShipments(data);
        } catch (error) {
            console.error("Error loading shipments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoaded || !user) return;
        fetchData();
    }, [isLoaded, user]);

    // 1. Get unpaid shipments (excluding canceled)
    const unpaidNet = shipments
        .filter((s) => s.otherDetails?.[0] !== "בוטל")
        .reduce((sum, s) => {
            const city = s.address?.[0] || "לא ידוע";
            const region = getRegionByCity(city);
            const deliveryPrice = region ? deliveryPrices[region] : 0;
            return sum + ((s.totalPrice || 0) - deliveryPrice);
        }, 0);
    // 2. Get all payments total
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    // 3. Net amount to display
    const netAmount = unpaidNet - totalPaid;
    const getStatusCount = (status: string) =>
        shipments.filter((s) => s.otherDetails?.[0] === status).length;

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <main className="p-6 space-y-6">
            {/* Net Balance Premium Card */}
            <StatCard
                title="יתרה נטו"
                value={netAmount}
                description="החיובים שלא שולמו (בניכוי משלוח)"
                icon={<Wallet />}
                className="bg-yellow-50 border border-yellow-300"
            />

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                <StatCard title="בהמתנה" value={getStatusCount("בהמתנה")} icon={<Clock />} clickable />
                <StatCard title="בסניף" value={getStatusCount("בסניף")} icon={<Package />} clickable />
                <StatCard title="במשלוח" value={getStatusCount("במשלוח")} icon={<Truck />} clickable />
                <StatCard title="נמסר" value={getStatusCount("נמסר")} icon={<Check />} clickable />
                <StatCard title="החזרות" value={getStatusCount("החזרות")} icon={<Undo />} clickable />
                <StatCard title="בוטל" value={getStatusCount("בוטל")} icon={<X />} clickable />
            </div>
        </main>
    );
}
