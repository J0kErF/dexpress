// app/courier/layout.tsx
import '../globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import CourierBottomBar from '@/components/custom/courier/BottomBar'; // ✅ import your bottom bar

export const metadata: Metadata = {
  title: 'Dexpress',
  description: 'ניהול משלוחים ותשלומים',
};

export const dynamic = 'force-dynamic';

export default async function CourierLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  // If the user is not signed in, redirect to the home page.
  if (!user) {
    return redirect('/');
  }

  const userId = user.id;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/clerk/${userId}`);
  if (res.ok) {
    const data = await res.json();

    // Only allow courier or admin roles
    if ((data.role !== 'admin' && data.role !== 'store') || data.isActive === false) {
      return redirect('/waitlist');
    }

    return (
      <html suppressHydrationWarning lang="he" dir="rtl">
        <body className="bg-background text-foreground">
          <div className="pb-16">
            <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
            <CourierBottomBar /> {/* ✅ Bottom bar always visible */}
            <Toaster position="top-center" richColors closeButton />
          </div>
        </body>
      </html>
    );
  }

  // Fallback if user data fetch fails
  return null;
}
