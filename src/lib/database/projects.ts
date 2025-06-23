import { supabase } from "@/lib/supabase"
import type { Project, ProjectMember } from "@/lib/supabase"

export class ProjectsService {
  static async getUserProjects(): Promise<Project[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");

      // First, get all organization IDs the user is a member of.
      const { data: orgMemberships, error: orgsError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id);

      if (orgsError) {
        console.error("Error fetching user's organization memberships:", orgsError);
        throw orgsError;
      }

      const orgIds = orgMemberships.map(m => m.organization_id);

      if (orgIds.length === 0) {
        return []; // User is not a member of any organization
      }

      // Now, fetch all projects from those organizations.
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          organization:organizations(*)
        `)
        .in("organization_id", orgIds)
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Error fetching projects for organizations:", projectsError);
        throw projectsError;
      }

      return projects || [];
    } catch (error) {
      console.error("Error in getUserProjects:", error);
      return [];
    }
  }

  static async getProjectById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          organization:organizations(
            id,
            name,
            slug
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        console.error("Error fetching project:", error)
        throw error
      }

      return data
    } catch (error: any) {
      if (error?.code === "PGRST116") {
        return null
      }
      console.error("Error in getProjectById:", error)
      throw error
    }
  }

  static async createProject(projectData: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Ensure the owner_id is set to the current user
      const projectDataWithOwner = {
        ...projectData,
        owner_id: user.id,
      }

      console.log("Creating project with data:", projectDataWithOwner)

      const { data, error } = await supabase.from("projects").insert([projectDataWithOwner]).select().single()

      if (error) {
        console.error("Error creating project:", error)
        throw error
      }

      console.log("Project created successfully:", data)
      return data
    } catch (error) {
      console.error("Error in createProject:", error)
      throw error
    }
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating project:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in updateProject:", error)
      throw error
    }
  }

  static async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) {
        console.error("Error deleting project:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in deleteProject:", error)
      return false
    }
  }

  static async getProjectMembers(projectId: string): Promise<(ProjectMember & { profile: any })[]> {
    try {
      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          profile:profiles!project_members_user_id_fkey(
            id,
            email,
            full_name,
            avatar_url,
            github_username
          )
        `)
        .eq("project_id", projectId)
        .order("added_at", { ascending: false })

      if (error) {
        console.error("Error fetching project members:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getProjectMembers:", error)
      throw error
    }
  }

  static async addProjectMember(memberData: {
    project_id: string
    user_id: string
    role: string
  }): Promise<any> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("project_members")
        .insert([
          {
            ...memberData,
            added_by: user.id,
            added_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error adding project member:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in addProjectMember:", error)
      throw error
    }
  }

  static async updateMemberRole(projectId: string, userId: string, newRole: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("project_members")
        .update({ role: newRole })
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating member role:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in updateMemberRole:", error);
      return false;
    }
  }
}
