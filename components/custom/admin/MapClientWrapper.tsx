// components/custom/admin/MapClientWrapper.tsx

"use client";

import dynamic from "next/dynamic";

// Dynamically import with SSR disabled
const AdminMap = dynamic(() => import("./AdminMap"), {
  ssr: false,
});

export default function MapClientWrapper() {
  return <AdminMap />;
}
