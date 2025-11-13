"use client";

import type React from "react";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TeamMember, TaskCategory } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "@/hooks/use-toast";

const categories: TaskCategory[] = [
  "UX",
  "frontend",
  "backend",
  "fullstack",
  "management",
  "testing",
];

interface TaskFormProps {
  teamMembers: TeamMember[];
}

export function TaskForm({ teamMembers }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory | "">("");
  const [assignedTo, setAssignedTo] = useState<string>("unassigned");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
        className:
          "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
      });
      return;
    }

    if (!db) {
      toast({
        title: "Error",
        description:
          "Firebase is not properly configured. Please check your setup.",
        variant: "destructive",
        className:
          "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("[v0] Adding task to Firebase:", {
        title: title.trim(),
        description: description.trim(),
        category,
        assignedTo,
      });

      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        description: description.trim(),
        category,
        assignedTo: assignedTo === "unassigned" ? null : assignedTo,
        timestamp: serverTimestamp(),
        status: "new",
      });

      setTitle("");
      setDescription("");
      setCategory("");
      setAssignedTo("unassigned");

      toast({
        title: "Success",
        description: "Task added successfully",
        className:
          "bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700",
      });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message || "Unknown error"}`,
        variant: "destructive",
        className:
          "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label
          htmlFor="title"
          className="text-gray-900 dark:text-gray-100 text-sm font-medium"
        >
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div>
        <Label
          htmlFor="description"
          className="text-gray-900 dark:text-gray-100 text-sm font-medium"
        >
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
          required
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div>
        <Label
          htmlFor="category"
          className="text-gray-900 dark:text-gray-100 text-sm font-medium"
        >
          Category
        </Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as TaskCategory)}
        >
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="assignedTo"
          className="text-gray-900 dark:text-gray-100 text-sm font-medium"
        >
          Assign To
        </Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500">
            <SelectValue placeholder="Select a team member" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} ({member.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add Task"}
      </Button>
    </form>
  );
}
