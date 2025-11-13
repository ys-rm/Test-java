"use client";

import type React from "react";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { MemberRole } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "../hooks/use-toast";

const roles: MemberRole[] = [
  "UX designer",
  "frontend developer",
  "backend developer",
  "fullstack developer",
  "project manager",
  "QA engineer",
];

export function TeamMemberForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<MemberRole | "">("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !role) {
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
      console.log("[v0] Adding team member to Firebase:", {
        name: name.trim(),
        role,
      });

      await addDoc(collection(db, "teamMembers"), {
        name: name.trim(),
        role,
      });

      setName("");
      setRole("");

      toast({
        title: "Success",
        description: "Team member added successfully",
        className:
          "bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700",
      });
    } catch (error: any) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: `Failed to add team member: ${
          error.message || "Unknown error"
        }`,
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
        <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team member name"
          required
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
        />
      </div>

      <div>
        <Label htmlFor="role" className="text-gray-900 dark:text-gray-100">
          Role
        </Label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as MemberRole)}
        >
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
            {roles.map((roleOption) => (
              <SelectItem key={roleOption} value={roleOption}>
                {roleOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 text-white"
      >
        {loading ? "Adding..." : "Add Team Member"}
      </Button>
    </form>
  );
}
