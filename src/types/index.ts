export interface TeamMember {
  id: string
  name: string
  role:
    | "UX designer"
    | "Frontend Developer"
    | "Backend Developer"
    | "Fullstack Developer"
    | "Project Manager"
    | "QA Engineer"
}

export interface Task {
  id: string
  title: string
  description: string
  category: "UX" | "frontend" | "backend" | "fullstack" | "management" | "testing"
  timestamp: number
  assignedTo?: string // member ID
  status: "new" | "in-progress" | "done"
}

export type TaskStatus = "new" | "in-progress" | "done"
export type TaskCategory = "UX" | "frontend" | "backend" | "fullstack" | "management" | "testing"
export type MemberRole =
  | "UX designer"
  | "frontend developer"
  | "backend developer"
  | "fullstack developer"
  | "project manager"
  | "QA engineer"
