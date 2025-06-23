import { supabase } from "@/lib/supabase"
import type { Organization, OrganizationMember } from "@/lib/supabase"

export class OrganizationsService {
  static async getUserOrganizations(): Promise<Organization[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // First get organizations where user is owner
      const { data: ownedOrgs, error: ownedError } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)

      if (ownedError) {
        console.error("Error fetching owned organizations:", ownedError)
        throw ownedError
      }

      // Then get organizations where user is a member
      const { data: memberOrgs, error: memberError } = await supabase
        .from("organization_members")
        .select(`
        organization:organizations(*)
      `)
        .eq("user_id", user.id)

      if (memberError) {
        console.error("Error fetching member organizations:", memberError)
        throw memberError
      }

      // Combine and deduplicate
      const allOrgs = [...(ownedOrgs || [])]
      const memberOrgData = memberOrgs?.map((m) => (m as any).organization as Organization).filter(Boolean) || []

      memberOrgData.forEach((org) => {
        if (!allOrgs.find((existing) => existing.id === org.id)) {
          allOrgs.push(org)
        }
      })

      return allOrgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error("Error in getUserOrganizations:", error)
      throw error
    }
  }

  static async createOrganization(
    orgData: Omit<Organization, "id" | "created_at" | "updated_at">,
  ): Promise<Organization | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Ensure the owner_id is set to the current user
      const organizationData = {
        ...orgData,
        owner_id: user.id,
      }

      console.log("Creating organization with data:", organizationData)

      const { data, error } = await supabase.from("organizations").insert([organizationData]).select().single()

      if (error) {
        console.error("Error creating organization:", error)
        throw error
      }

      console.log("Organization created successfully:", data)
      return data
    } catch (error) {
      console.error("Error in createOrganization:", error)
      throw error
    }
  }

  static async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    try {
      const { data, error } = await supabase.from("organizations").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating organization:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in updateOrganization:", error)
      throw error
    }
  }

  static async deleteOrganization(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("organizations").delete().eq("id", id)

      if (error) {
        console.error("Error deleting organization:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in deleteOrganization:", error)
      return false
    }
  }

  static async getOrganizationMembers(organizationId: string): Promise<(OrganizationMember & { profile: any })[]> {
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          *,
          profile:profiles!organization_members_user_id_fkey(
            id,
            email,
            full_name,
            avatar_url,
            github_username
          )
        `)
        .eq("organization_id", organizationId)
        .order("joined_at", { ascending: false })

      if (error) {
        console.error("Error fetching organization members:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getOrganizationMembers:", error)
      throw error
    }
  }

  static async updateMemberRole(
    organizationId: string,
    userId: string,
    role: OrganizationMember["role"],
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("organization_members")
        .update({ role })
        .eq("organization_id", organizationId)
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating member role:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in updateMemberRole:", error)
      return false
    }
  }

  static async removeMember(organizationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", userId)

      if (error) {
        console.error("Error removing member:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in removeMember:", error)
      return false
    }
  }

  static async inviteUser(organizationId: string, email: string, role: string, message?: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("organization_invitations").insert([
        {
          organization_id: organizationId,
          invited_email: email,
          role,
          invited_by: user.id,
          message,
        },
      ])

      if (error) {
        console.error("Error inviting user:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in inviteUser:", error)
      return false
    }
  }

  static async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // First try to get the organization by slug
      const { data: org, error: orgError } = await supabase.from("organizations").select("*").eq("slug", slug).single()

      if (orgError) {
        console.error("Error fetching organization by slug:", orgError)
        return null
      }

      // Check if user has access to this organization
      const hasAccess = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", org.id)
        .eq("user_id", user.id)
        .single()

      if (hasAccess.error && org.owner_id !== user.id) {
        // User is not a member and not the owner
        return null
      }

      return org
    } catch (error) {
      console.error("Error in getOrganizationBySlug:", error)
      return null
    }
  }

  static async getUserRoleInOrganization(organizationId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("owner_id")
        .eq("id", organizationId)
        .single();

      if (orgError) {
        console.error("Error fetching organization owner:", orgError);
        return null;
      }

      if (org.owner_id === user.id) {
        return "owner";
      }

      const { data, error } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        // This can happen if the user is not a member, which is not an error case.
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error("Error in getUserRoleInOrganization:", error);
      return null;
    }
  }

  static async getOrganizationBySlugPublic(slug: string): Promise<Organization | null> {
    try {
      // This method doesn't require authentication - for public invite pages
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug, description, avatar_url, created_at, owner_id")
        .eq("slug", slug)
        .single()

      if (orgError) {
        console.error("Error fetching organization by slug (public):", orgError)
        return null
      }

      return org
    } catch (error) {
      console.error("Error in getOrganizationBySlugPublic:", error)
      return null
    }
  }

  static async addOrganizationMember(memberData: {
    organization_id: string
    user_id: string
    role: string
  }): Promise<any> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("organization_members")
        .insert([
          {
            ...memberData,
            invited_by: user.id,
            joined_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error adding organization member:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in addOrganizationMember:", error)
      throw error
    }
  }

  static async checkUserMembership(organizationId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        console.error("Error checking membership:", error)
        return false
      }

      return !!data
    } catch (error) {
      console.error("Error in checkUserMembership:", error)
      return false
    }
  }
}
