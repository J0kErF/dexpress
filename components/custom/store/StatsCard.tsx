"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  clickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className = "",
  clickable = false,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (clickable) {
      router.push(`/store/shipments?status=${encodeURIComponent(title)}`);
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={`flex flex-col justify-between p-5 rounded-xl shadow-md min-h-[110px] transition-all ${
        clickable ? "cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-yellow-400" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h2>
        {icon && <div className="text-xl text-yellow-600">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white leading-snug">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}
    </Card>
  );
};

export default StatCard;
