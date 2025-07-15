"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();

  const hidePortalRoutes = ["/store", "/courier", "/admin"];
  const shouldHidePortal = hidePortalRoutes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  return (
    <header className="w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        {/* <Image src="/logo.svg" alt="Dexpress" width={30} height={30} /> */}
        <span className="text-lg font-bold text-gray-800">Daleel Express</span>
      </Link>

      {/* Auth Actions */}
      <div className="flex items-center gap-3">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
          {!shouldHidePortal && (
            <Link
              href="/waitlist"
              className="text-sm px-3 py-1 rounded-md bg-yellow-500 text-white hover:bg-gray-800"
            >
              פורטל
            </Link>
          )}
        </SignedIn>

        <SignedOut>
          <SignInButton>
            <button className="text-sm px-3 py-1 rounded-md bg-black text-white hover:bg-gray-800">
              התחברות
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
