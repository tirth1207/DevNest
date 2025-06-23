import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"

export class ProfilesService {
  static async getCurrentProfile(): Promise<Profile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in getCurrentProfile:", error)
      throw error
    }
  }

  static async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

      if (error) {
        console.error("Error updating profile:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in updateProfile:", error)
      throw error
    }
  }
}
