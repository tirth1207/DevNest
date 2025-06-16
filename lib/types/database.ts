export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          github_username: string | null
          github_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          github_username?: string | null
          github_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          github_username?: string | null
          github_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          avatar_url: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          avatar_url?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          avatar_url?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          slug: string
          status: "planning" | "active" | "on_hold" | "completed" | "archived"
          goals: string[] | null
          github_repo_url: string | null
          github_repo_id: number | null
          github_default_branch: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          slug: string
          status?: "planning" | "active" | "on_hold" | "completed" | "archived"
          goals?: string[] | null
          github_repo_url?: string | null
          github_repo_id?: number | null
          github_default_branch?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          slug?: string
          status?: "planning" | "active" | "on_hold" | "completed" | "archived"
          goals?: string[] | null
          github_repo_url?: string | null
          github_repo_id?: number | null
          github_default_branch?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: "todo" | "in_progress" | "review" | "done" | "cancelled"
          priority: "low" | "medium" | "high" | "urgent"
          assignee_id: string | null
          reporter_id: string
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          tags: string[] | null
          github_issue_number: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: "todo" | "in_progress" | "review" | "done" | "cancelled"
          priority?: "low" | "medium" | "high" | "urgent"
          assignee_id?: string | null
          reporter_id: string
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[] | null
          github_issue_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: "todo" | "in_progress" | "review" | "done" | "cancelled"
          priority?: "low" | "medium" | "high" | "urgent"
          assignee_id?: string | null
          reporter_id?: string
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[] | null
          github_issue_number?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          project_id: string
          title: string
          content: any | null
          slug: string
          parent_id: string | null
          author_id: string
          last_edited_by: string | null
          is_published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content?: any | null
          slug: string
          parent_id?: string | null
          author_id: string
          last_edited_by?: string | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: any | null
          slug?: string
          parent_id?: string | null
          author_id?: string
          last_edited_by?: string | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
