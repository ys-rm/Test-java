"use client";

import type { TeamMember, TaskCategory } from ".././types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const categories: TaskCategory[] = [
  "UX",
  "frontend",
  "backend",
  "fullstack",
  "management",
  "testing",
];

interface FilterControlsProps {
  teamMembers: TeamMember[];
  selectedMember: string;
  setSelectedMember: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortBy: "timestamp" | "title";
  setSortBy: (value: "timestamp" | "title") => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
}

export function FilterControls({
  teamMembers,
  selectedMember,
  setSelectedMember,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
}: FilterControlsProps) {
  const clearFilters = () => {
    setSelectedMember("");
    setSelectedCategory("");
    setSortBy("timestamp");
    setSortDirection("desc");
  };

  const activeFiltersCount = [selectedMember, selectedCategory].filter(
    Boolean
  ).length;

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          <div className="w-4 h-4 bg-teal-500 dark:bg-teal-400 rounded" />
          <span>Filters & Sort</span>
          {activeFiltersCount > 0 && (
            <span className="bg-teal-100 text-teal-600 dark:bg-teal-800 dark:text-teal-200 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger
              aria-label="Filter by team member"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
            >
              <SelectValue placeholder="Filter by member" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectItem value="allMembers">All members</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              aria-label="Filter by category"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
            >
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectItem value="allCategories">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "timestamp" | "title")}
          >
            <SelectTrigger
              aria-label="Sort by"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectItem value="timestamp">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            value={sortDirection}
            onValueChange={(value) => setSortDirection(value as "asc" | "desc")}
          >
            <SelectTrigger
              aria-label="Sort direction"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
            >
              <SelectValue placeholder="Sort direction" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectItem value="desc">
                {sortBy === "timestamp" ? "Newest First" : "Z → A"}
              </SelectItem>
              <SelectItem value="asc">
                {sortBy === "timestamp" ? "Oldest First" : "A → Z"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={clearFilters}
          disabled={activeFiltersCount === 0}
          aria-label="Clear all filters"
          className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <span className="mr-1">×</span>
          Clear Filters
        </Button>
      </div>
    </Card>
  );
}
