import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Organization {
  id: string
  created_at?: string
  updated_at?: string
  name: string
  slug: string
  description?: string
  avatar_url?: string
  owner_id: string
  github_org_name?: string
  settings?: any
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: "owner" | "admin" | "member" | "viewer"
  invited_by?: string
  invited_at?: string
  joined_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  github_username?: string
  github_id?: number
  bio?: string
  timezone?: string
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  organization_id: string
  created_at?: string
  updated_at?: string
  name: string
  slug: string
  description?: string
  readme?: string
  status?: string
  visibility?: string
  github_repo_url?: string
  github_repo_id?: number
  owner_id: string
  settings?: any
  organization?: Organization
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: "admin" | "write" | "read"
  added_by: string
  added_at?: string
}

export interface Task {
  id: string
  project_id: string
  number?: number
  created_at?: string
  updated_at?: string
  title: string
  description?: string
  status: "open" | "in_progress" | "closed" | "blocked"
  priority: "low" | "medium" | "high" | "critical"
  type: "task" | "bug" | "feature" | "epic"
  assignee_id?: string
  reporter_id: string
  due_date?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  labels?: string[] | null
  metadata?: any | null
  closed_at?: string | null
}

export interface TaskWithRelations extends Task {
  assignee: Profile
  reporter: Profile
  project: Project
}
