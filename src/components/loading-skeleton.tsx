import { Card } from "./ui/card";

export function TaskCardSkeleton() {
  return (
    <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
      </div>
    </Card>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-8 animate-pulse" />
      </div>
      <div className="space-y-3 min-h-[400px] bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-gray-200 dark:border-gray-700">
        {Array.from({ length: 3 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
