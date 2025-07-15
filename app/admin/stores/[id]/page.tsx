"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Trash } from "lucide-react";

const days = [
    { label: "ראשון", value: "Sunday" },
    { label: "שני", value: "Monday" },
    { label: "שלישי", value: "Tuesday" },
    { label: "רביעי", value: "Wednesday" },
    { label: "חמישי", value: "Thursday" },
    { label: "שישי", value: "Friday" },
    { label: "שבת", value: "Saturday" },
];

export default function StoreDetails() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<any>(null);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await fetch(`/api/stores/${id}`);
                const data = await res.json();
                setForm(data);
            } catch (error) {
                toast.error("שגיאה בטעינת הסניף");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchStore();
    }, [id]);

    const handleInputChange = (field: string, value: string) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleWorkingHourChange = (idx: number, field: "open" | "close", value: string) => {
        const updatedHours = [...form.workingHours];
        updatedHours[idx][field] = value;
        setForm((prev: any) => ({ ...prev, workingHours: updatedHours }));
    };

    const toggleClosed = (idx: number) => {
        const updatedHours = [...form.workingHours];
        updatedHours[idx].closed = !updatedHours[idx].closed;
        setForm((prev: any) => ({ ...prev, workingHours: updatedHours }));
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/stores/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error();

            toast.success("הסניף עודכן בהצלחה");
            router.push("/admin/stores");
        } catch {
            toast.error("שגיאה בעדכון הסניף");
        }
    };

    const handleDelete = async () => {
        if (!confirm("האם אתה בטוח שברצונך למחוק את הסניף הזה?")) return;

        try {
            const res = await fetch(`/api/stores/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error();

            toast.success("הסניף נמחק");
            router.push("/admin/stores");
        } catch {
            toast.error("שגיאה במחיקת הסניף");
        }
    };

    if (loading) {
        return (
            <main className="p-6 max-w-3xl mx-auto space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-10 w-40" />
            </main>
        );
    }

    if (!form) {
        return (
            <main className="p-6 max-w-2xl mx-auto text-center text-gray-500">
                לא נמצא סניף
            </main>
        );
    }

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-yellow-700">עריכת סניף</h1>

            <Card className="p-6 space-y-4">
                <div>
                    <Label>שם העסק</Label>
                    <Input
                        value={form.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                    />
                </div>

                <div>
                    <Label>כתובת</Label>
                    <Input
                        value={form.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                </div>

                <div>
                    <Label>מספר טלפון</Label>
                    <Input
                        value={form.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <Label className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        שעות פעילות הסניף
                    </Label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {days.map((day, idx) => {
                            const hour = form.workingHours[idx];
                            const isClosed = hour.closed;
                            return (
                                <Card
                                    key={idx}
                                    className="p-4 flex flex-col justify-between shadow-md border border-gray-200 dark:border-gray-700 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-base font-semibold text-gray-700 dark:text-white">
                                            {day.label}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">סגור</span>
                                            <div dir="ltr">
                                                <Switch
                                                    checked={isClosed}
                                                    onCheckedChange={() => toggleClosed(idx)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!isClosed ? (
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <Label className="text-xs text-gray-500 dark:text-gray-300">
                                                    שעה פתיחה
                                                </Label>
                                                <Input
                                                    type="time"
                                                    value={hour.open}
                                                    onChange={(e) => handleWorkingHourChange(idx, "open", e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs text-gray-500 dark:text-gray-300">
                                                    שעה סגירה
                                                </Label>
                                                <Input
                                                    type="time"
                                                    value={hour.close}
                                                    onChange={(e) => handleWorkingHourChange(idx, "close", e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-4">הסניף סגור ביום זה</p>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        onClick={handleSave}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
                    >
                        שמור שינויים
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="flex gap-2"
                    >
                        <Trash size={16} />
                        מחק סניף
                    </Button>
                </div>
            </Card>
        </main>
    );
}
