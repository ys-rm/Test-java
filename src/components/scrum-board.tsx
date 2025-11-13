"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { TeamMember, Task } from "../types";
import { TeamMemberForm } from "./team-member-form";
import { TaskForm } from "./task-form";
import { KanbanBoard } from "./kanban-board";
import { FilterControls } from "./filter-controls";
import { ErrorBoundary } from "./error-boundary";
import { KanbanColumnSkeleton } from "./loading-skeleton";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { FirebaseStatus } from "./firebase-status";

export function ScrumBoard() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"timestamp" | "title">("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    console.log("[v0] Setting up Firebase listeners");
    try {
      const teamMembersQuery = query(
        collection(db, "teamMembers"),
        orderBy("name")
      );
      const unsubscribeTeamMembers = onSnapshot(
        teamMembersQuery,
        (snapshot) => {
          const members: TeamMember[] = [];
          snapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data() } as TeamMember);
          });
          console.log("[v0] Team members loaded:", members.length);
          setTeamMembers(members);
          setError(null);
        },
        (err) => {
          console.error("[v0] Error fetching team members:", err);
          setError(`Failed to load team members: ${err.message}`);
        }
      );
      const tasksQuery = query(
        collection(db, "tasks"),
        orderBy("timestamp", "desc")
      );
      const unsubscribeTasks = onSnapshot(
        tasksQuery,
        (snapshot) => {
          const taskList: Task[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            taskList.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toMillis?.() || Date.now(),
            } as Task);
          });
          console.log("[v0] Tasks loaded:", taskList.length);
          setTasks(taskList);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("[v0] Error fetching tasks:", err);
          setError(`Failed to load tasks: ${err.message}`);
          setLoading(false);
        }
      );
      return () => {
        unsubscribeTeamMembers();
        unsubscribeTasks();
      };
    } catch (err: any) {
      console.error("[v0] Failed to set up Firebase listeners:", err);
      setError(`Database connection failed: ${err.message}`);
      setLoading(false);
    }
  }, []);

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (
          selectedMember &&
          selectedMember !== "allMembers" &&
          task.assignedTo !== selectedMember
        )
          return false;
        if (
          selectedCategory &&
          selectedCategory !== "allCategories" &&
          task.category !== selectedCategory
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "timestamp") {
          return sortDirection === "desc"
            ? b.timestamp - a.timestamp
            : a.timestamp - b.timestamp;
        } else {
          return sortDirection === "desc"
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        }
      });
  }, [tasks, selectedMember, selectedCategory, sortBy, sortDirection]);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <FirebaseStatus currentMode="firebase" />
        {error && (
          <Alert
            variant="destructive"
            className="max-w-4xl mx-auto border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
              <div className="flex-1">
                <AlertDescription className="text-red-700 dark:text-red-200">
                  {error}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <Tabs defaultValue="board" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="board"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              Scrum Board
            </TabsTrigger>
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              Team & Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-6">
            <FilterControls
              teamMembers={teamMembers}
              selectedMember={selectedMember}
              setSelectedMember={setSelectedMember}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
            />

            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                <KanbanColumnSkeleton />
                <KanbanColumnSkeleton />
                <KanbanColumnSkeleton />
              </div>
            ) : (
              <KanbanBoard
                tasks={filteredAndSortedTasks}
                teamMembers={teamMembers}
              />
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Add Team Member
                </h2>
                <TeamMemberForm />
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Add Task
                </h2>
                <TaskForm teamMembers={teamMembers} />
              </Card>
            </div>

            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Team Members ({teamMembers.length})
              </h2>
              <div className="grid gap-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {member.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({member.role})
                      </span>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && !loading && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No team members added yet
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
