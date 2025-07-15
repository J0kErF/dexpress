"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function AddStorePage() {
    const router = useRouter();
    const days = [
        { label: "ראשון", value: "Sunday" },
        { label: "שני", value: "Monday" },
        { label: "שלישי", value: "Tuesday" },
        { label: "רביעי", value: "Wednesday" },
        { label: "חמישי", value: "Thursday" },
        { label: "שישי", value: "Friday" },
        { label: "שבת", value: "Saturday" },
    ];

    const [form, setForm] = useState({
        businessName: "",
        address: "",
        phoneNumber: "",
        workingHours: days.map((d) => ({
            day: d.value,
            closed: false,
            open: "",
            close: "",
        })),
    });



    const handleInputChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleWorkingHourChange = (index: number, field: "open" | "close", value: string) => {
        const updatedHours = [...form.workingHours];
        updatedHours[index][field] = value;
        setForm((prev) => ({ ...prev, workingHours: updatedHours }));
    };

    const toggleClosed = (index: number) => {
        const updatedHours = [...form.workingHours];
        updatedHours[index].closed = !updatedHours[index].closed;
        setForm((prev) => ({ ...prev, workingHours: updatedHours }));
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch("/api/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to add store");

            router.push("/admin/stores");
        } catch (error) {
            console.error("❌ Error adding store:", error);
            alert("שגיאה בהוספת חנות");
        }
    };

    return (
        <main className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-yellow-700">הוספת סניף חדש</h1>

            <Card className="space-y-4 p-6">
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
                            const closed = hour.closed;

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
                                                    checked={closed}
                                                    onCheckedChange={() => toggleClosed(idx)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!closed ? (
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
                <Button onClick={handleSubmit} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    שמור סניף
                </Button>
            </Card>
        </main>
    );
}
