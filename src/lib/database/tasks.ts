import { supabase } from "@/lib/supabase"
import type { Task, TaskWithRelations } from "@/lib/supabase"

export class TasksService {
  static async getProjectTasks(
    projectId: string,
    filters?: {
      status?: Task["status"]
      priority?: Task["priority"]
      assignee_id?: string
      search?: string
    },
  ): Promise<TaskWithRelations[]> {
    try {
      let query = supabase
        .from("tasks")
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          reporter:profiles!tasks_reporter_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          project:projects(
            id,
            name,
            slug
          )
        `)
        .eq("project_id", projectId)

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority)
      }
      if (filters?.assignee_id) {
        query = query.eq("assignee_id", filters.assignee_id)
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getProjectTasks:", error)
      throw error
    }
  }

  static async getTaskById(id: string): Promise<TaskWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          reporter:profiles!tasks_reporter_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          project:projects(
            id,
            name,
            slug,
            organization:organizations(
              id,
              name,
              slug
            )
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching task:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in getTaskById:", error)
      throw error
    }
  }

  static async createTask(
    taskData: Omit<Task, "id" | "number" | "created_at" | "updated_at">,
  ): Promise<TaskWithRelations | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Ensure the reporter_id is set to the current user
      const taskDataWithReporter = {
        ...taskData,
        reporter_id: user.id,
      }

      console.log("Creating task with data:", taskDataWithReporter)

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskDataWithReporter])
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          reporter:profiles!tasks_reporter_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          project:projects(
            id,
            name,
            slug
          )
        `)
        .single()

      if (error) {
        console.error("Error creating task:", error)
        throw error
      }

      console.log("Task created successfully:", data)
      return data
    } catch (error) {
      console.error("Error in createTask:", error)
      throw error
    }
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<TaskWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          reporter:profiles!tasks_reporter_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          project:projects(
            id,
            name,
            slug
          )
        `)
        .single()

      if (error) {
        console.error("Error updating task:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in updateTask:", error)
      throw error
    }
  }

  static async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) {
        console.error("Error deleting task:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in deleteTask:", error)
      return false
    }
  }

  static async getUserTasks(): Promise<TaskWithRelations[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          assignee:profiles!tasks_assignee_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          reporter:profiles!tasks_reporter_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          project:projects(
            id,
            name,
            slug
          )
        `,
        )
        .eq("assignee_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching user tasks:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserTasks:", error)
      throw error
    }
  }
}
