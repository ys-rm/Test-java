"use client";

import type React from "react";

import { useDroppable } from "@dnd-kit/core";
import { Card } from "./ui/card";

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  color: "blue-50" | "amber-50" | "teal-50";
  children: React.ReactNode;
}

const colorClasses = {
  "blue-50":
    "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-200",
  "amber-50":
    "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-200",
  "teal-50":
    "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-900/50 dark:text-teal-200",
};

export function DroppableColumn({
  id,
  title,
  count = 0,
  color,
  children,
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
      <div className={`p-3 border-b ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs font-medium bg-white/70 dark:bg-gray-800/70 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>

      <Card
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] p-4 border-t-0 transition-colors ${
          isOver
            ? "bg-gray-100 dark:bg-gray-700 border-teal-500"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="space-y-3">{children}</div>
      </Card>
    </div>
  );
}
