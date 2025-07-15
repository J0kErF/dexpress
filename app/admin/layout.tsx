// app/admin/layout.tsx
import AdminSidebar from "@/components/custom/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-0 md:mr-64 p-4 bg-muted overflow-auto">
        {children}
      </main>
    </div>
  );
}
