"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Task, TeamMember } from "../types";
import { TaskCard } from "./task-card";
import { DroppableColumn } from "./droppable-column";
import { useToast } from "../hooks/use-toast";

interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
}

export function KanbanBoard({ tasks, teamMembers }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const todoTasks = tasks.filter((task) => task.status === "new");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const statusMap = {
      todo: "todo",
      "in-progress": "in-progress",
      done: "done",
    } as const;

    const newStatus = statusMap[over.id as keyof typeof statusMap];
    if (!newStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    console.log(
      "[v0] Dragging task",
      taskId,
      "from",
      task.status,
      "to",
      newStatus
    );

    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: newStatus,
      });

      toast({
        title: "Task Moved",
        description: `Task moved to ${newStatus.replace("-", " ")}`,
        className:
          "bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700",
      });
    } catch (error) {
      console.error("[v0] Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
        className:
          "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid md:grid-cols-3 gap-6">
        <DroppableColumn
          id="todo"
          count={doneTasks.length}
          title="To Do"
          color="blue-50"
        >
          <SortableContext
            items={todoTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
                isDraggable={true}
              />
            ))}
          </SortableContext>
          {todoTasks.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No tasks to do
            </p>
          )}
        </DroppableColumn>

        <DroppableColumn
          id="in-progress"
          count={doneTasks.length}
          title="In Progress"
          color="amber-50"
        >
          <SortableContext
            items={inProgressTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
                isDraggable={true}
              />
            ))}
          </SortableContext>
          {inProgressTasks.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No tasks in progress
            </p>
          )}
        </DroppableColumn>

        <DroppableColumn
          id="done"
          title="Done"
          count={doneTasks.length}
          color="teal-50"
        >
          <SortableContext
            items={doneTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
                isDraggable={true}
              />
            ))}
          </SortableContext>
          {doneTasks.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No completed tasks
            </p>
          )}
        </DroppableColumn>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90 shadow-md bg-white dark:bg-gray-800">
            <TaskCard
              task={activeTask}
              teamMembers={teamMembers}
              isDraggable={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
