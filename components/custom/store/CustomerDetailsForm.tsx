"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { regionCities } from "@/lib/regions"; // Update path if needed

type Props = {
    customerName: string;
    phoneNumber: string;
    city: string;
    location: string;
    onChange: (field: string, value: string) => void;
};

export default function CustomerDetailsForm({
  customerName,
  phoneNumber,
  city,
  location,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const cities = Object.values(regionCities).flat();

  const filteredCities = useMemo(() => {
    return cities
      .filter((cityName) =>
        cityName.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 5); // ✅ limit to 5 results
  }, [search]);

  return (
    <Card dir="rtl" className="shadow-sm border-muted bg-background text-foreground">
      <CardHeader>
        <CardTitle className="text-right text-lg font-semibold">
          פרטי לקוח
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="שם הלקוח"
          value={customerName}
          onChange={(e) => onChange("customerName", e.target.value)}
          required
        />
        <Input
          placeholder="מספר טלפון"
          value={phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          required
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between">
              {city || "בחר עיר"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" side="top">
            <Command>
              <CommandInput
                placeholder="חפש עיר..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="max-h-48 overflow-auto">
                <CommandGroup>
                  {filteredCities.map((cityName) => (
                    <CommandItem
                      key={cityName}
                      value={cityName}
                      onSelect={() => {
                        onChange("address.0", cityName);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      {cityName}
                    </CommandItem>
                  ))}
                  {filteredCities.length === 0 && (
                    <CommandItem disabled>לא נמצאו תוצאות</CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          placeholder="כתובת מלאה"
          value={location}
          onChange={(e) => onChange("address.1", e.target.value)}
        />
      </CardContent>
    </Card>
  );
}