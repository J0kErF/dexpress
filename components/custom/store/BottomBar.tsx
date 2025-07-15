"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  PlusCircle,
  CreditCard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "בית", icon: Home, href: "/store" },
  { label: "משלוחים", icon: Package, href: "/store/shipments" },
  { label: "הוסף משלוח", icon: PlusCircle, href: "/store/shipments/add" },
  { label: "תשלומים", icon: CreditCard, href: "/store/payments" },
  { label: "הגדרות", icon: Settings, href: "/store/settings" },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 dark:bg-black dark:border-gray-800 shadow-sm"
    >
      <ul className="flex justify-between items-center text-xs px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-primary"
                    : "text-gray-500 hover:text-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[11px]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
