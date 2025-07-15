// app/store/layout.tsx
import '../globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import BottomBar from '@/components/custom/store/BottomBar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    title: 'Dexpress',
    description: 'ניהול משלוחים ותשלומים',
};
export const dynamic = 'force-dynamic';

export default async function StoreLayout({ children }: { children: ReactNode }) {
    const user = await currentUser();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/clerk/${user.id}`);
    if (res.ok) {
        const data = await res.json();
        // Not signed in
        if (!user) {
            return redirect('/');
        }
        // Ensure publicMetadata is embedded in session token (enable in Clerk Dashboard)
        // Only allow store role with valid storeId
        if (data.role !== 'store' || data.storeId === '-1' || data.isActive === false) {
            return redirect('/waitlist');
        }

        return (
            <html suppressHydrationWarning lang="he" dir="rtl">
                <body className="bg-background text-foreground">
                    <div className="pb-16">
                        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
                        <BottomBar />
                        <Toaster position="top-center" richColors closeButton />
                    </div>
                </body>
            </html>
        );
    }
}