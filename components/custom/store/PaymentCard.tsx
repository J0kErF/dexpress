"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { deliveryPrices, regionCities, getRegionLabel } from "@/lib/regions";

type Props = {
    totalPrice: string;
    city: string;
    onChange: (field: "totalPrice" , value: any) => void;
};

export default function PaymentCard({ totalPrice, city, onChange }: Props) {
    // Find delivery region based on city
    const matchedRegion = Object.entries(regionCities).find(([_, cities]) => cities.includes(city));
    const deliveryPrice = matchedRegion
        ? deliveryPrices[matchedRegion[0] as keyof typeof deliveryPrices]
        : 0;

    const totalNum = parseFloat(totalPrice || "0");
    const netAmount = totalNum - deliveryPrice;

    return (
        <Card className="shadow-sm border-muted bg-background text-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold" dir="rtl">
                    תשלום
                </CardTitle>
                <CreditCard className="w-5 h-5 text-muted-foreground" />
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Total price input */}
                <div className="flex flex-col items-center gap-1">
                    <Label htmlFor="totalPrice" dir="rtl" className="text-sm">
                        סכום לתשלום
                    </Label>
                    <div className="relative w-full max-w-[200px]">
                        <Input
                            id="totalPrice"
                            type="number"
                            inputMode="numeric"
                            value={totalPrice}
                            onChange={(e) => onChange("totalPrice", e.target.value)}
                            className="text-center pr-10 no-spinner"
                            placeholder="0"
                        />
                        <span className="absolute inset-y-0 left-3 flex items-center text-lg font-semibold text-muted-foreground pointer-events-none">
                            ₪
                        </span>
                    </div>
                </div>

                {/* Shipping info */}
                <div className="w-full rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground shadow-sm" dir="rtl">
                    {city && matchedRegion ? (
                        <div className="space-y-1 text-right">
                            <p>
                                משלוח לאזור <span className="font-semibold text-foreground">
                                    {getRegionLabel(matchedRegion[0] as "north" | "center" | "south" | "westBank")}
                                </span>:{" "}
                                <span className="font-medium text-green-700">₪{deliveryPrice}</span>
                            </p>
                            <p>
                                סכום נטו לאחר ניכוי:{" "}
                                <span className="font-medium text-primary">
                                    ₪{ netAmount }
                                </span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">בחר עיר להצגת עלות משלוח</p>
                    )}
                </div>

                {/* Badge with explanation */}
                <Badge
                    variant="outline"
                    className={cn(
                        "w-full justify-center py-2 text-sm font-medium text-center leading-snug bg-yellow-100 text-yellow-800 border-yellow-300"
                    )}
                >
                        צריך להכניס הסכום שצריך לגבות מהלקוח, כולל עלות משלוח.
                        <br />
                </Badge>
            </CardContent>
        </Card>
    );
}
