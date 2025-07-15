// components/custom/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Map,
    Truck,
    CreditCard,
    Store,
    Users,
    Settings,
    Waypoints,
} from "lucide-react";

const navItems = [
    { href: "/admin", label: "דשבורד", icon: LayoutDashboard },
    { href: "/admin/map", label: "מפה", icon: Map },
    { href: "/admin/routes", label: "מסלולים", icon: Waypoints },
    { href: "/admin/shipments", label: "משלוחים", icon: Truck },
    { href: "/admin/payments", label: "תשלומים", icon: CreditCard },
    { href: "/admin/stores", label: "חנויות", icon: Store },
    { href: "/admin/users", label: "משתמשים", icon: Users },
    { href: "/admin/settings", label: "הגדרות", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="fixed top-0 right-0 md:w-64  bg-white h-screen shadow-lg border-l z-40 p-4 flex flex-col gap-2"
            dir="rtl"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Daleel Express</h2>
            <nav className="flex flex-col gap-1">
                {navItems.map(({ href, label, icon: Icon }) => {

                    const isDashboard = href === "/admin";
                    const isActive = isDashboard
                        ? pathname === href
                        : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium
              ${isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
