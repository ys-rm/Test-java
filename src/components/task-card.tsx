"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Task, TeamMember, TaskCategory } from "../types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Edit, CheckCircle, PlayCircle, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface TaskCardProps {
  task: Task;
  teamMembers: TeamMember[];
  isDraggable?: boolean;
}

const categoryColors: Record<TaskCategory, string> = {
  UX: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/50",
  frontend:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50",
  backend:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50",
  fullstack:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/50",
  management:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/50",
  testing:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50",
};

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "new", label: "New" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function TaskCard({
  task,
  teamMembers,
  isDraggable = true,
}: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const { toast } = useToast();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignedMember = task.assignedTo
    ? teamMembers.find((m) => m.id === task.assignedTo)
    : null;

  const handleUpdateField = <K extends keyof Task>(
    field: K,
    value: Task[K]
  ) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (
      !editedTask.title.trim() ||
      !editedTask.description.trim() ||
      !editedTask.category
    ) {
      toast({
        title: "Error",
        description: "Title, description, and category are required",
        variant: "destructive",
        className:
          "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
      });
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        title: editedTask.title.trim(),
        description: editedTask.description.trim(),
        category: editedTask.category,
        assignedTo:
          editedTask.assignedTo === "unassigned" ? null : editedTask.assignedTo,
        status: editedTask.status,
      });
      toast({
        title: "Task Updated",
        description: "Task details have been updated",
        className:
          "bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("[v0] Error updating task:", error);
      toast({
        title: "Error",
        description: `Failed to update task: ${
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

  const handleStartTask = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        status: "in-progress",
      });
      toast({
        title: "Task Started",
        description: "Task moved to In Progress",
        className:
          "bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700",
      });
    } catch (error: any) {
      console.error("[v0] Error starting task:", error);
      toast({
        title: "Error",
        description: `Failed to start task: ${
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

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        status: "done",
      });
      toast({
        title: "Task Completed",
        description: "Task moved to Done",
        className:
          "bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700",
      });
    } catch (error: any) {
      console.error("[v0] Error completing task:", error);
      toast({
        title: "Error",
        description: `Failed to complete task: ${
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

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "tasks", task.id));
      toast({
        title: "Task Deleted",
        description: "Task has been permanently deleted",
        className:
          "bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700",
      });
    } catch (error: any) {
      console.error("[v0] Error deleting task:", error);
      toast({
        title: "Error",
        description: `Failed to delete task: ${
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
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDraggable ? listeners : {})}
      className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing active:shadow-lg"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight text-gray-900 dark:text-gray-100 flex-1">
            {task.title}
          </h4>
          <Badge
            variant="outline"
            className={`text-xs ${categoryColors[task.category]}`}
          >
            {task.category}
          </Badge>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">
                  Edit Task
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="edit-title"
                    className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                  >
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={editedTask.title}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-description"
                    className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editedTask.description}
                    onChange={(e) =>
                      handleUpdateField("description", e.target.value)
                    }
                    rows={3}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-category"
                    className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                  >
                    Category
                  </Label>
                  <Select
                    value={editedTask.category}
                    onValueChange={(value) =>
                      handleUpdateField("category", value as TaskCategory)
                    }
                  >
                    <SelectTrigger
                      id="edit-category"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      {Object.keys(categoryColors).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="edit-assignedTo"
                    className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                  >
                    Assign To
                  </Label>
                  <Select
                    value={editedTask.assignedTo || "unassigned"}
                    onValueChange={(value) =>
                      handleUpdateField("assignedTo", value)
                    }
                  >
                    <SelectTrigger
                      id="edit-assignedTo"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <SelectValue />
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
                <div>
                  <Label
                    htmlFor="edit-status"
                    className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                  >
                    Status
                  </Label>
                  <Select
                    value={editedTask.status}
                    onValueChange={(value) =>
                      handleUpdateField("status", value)
                    }
                  >
                    <SelectTrigger
                      id="edit-status"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                    Created Date & Time
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    {new Date(task.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSave}
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
          {task.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{new Date(task.timestamp).toLocaleDateString()}</span>
          {assignedMember ? (
            <Badge
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {assignedMember.name}
            </Badge>
          ) : (
            <span>Unassigned</span>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {(task.status === "todo" || task.status === "new") && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartTask}
              disabled={loading}
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Start Task
            </Button>
          )}
          {task.status === "in-progress" && (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Done
            </Button>
          )}
          {task.status === "done" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
