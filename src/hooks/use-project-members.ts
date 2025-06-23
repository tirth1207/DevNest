"use client"

import { useState, useEffect } from "react"
import { ProjectsService } from "@/lib/database/projects"
import type { ProjectMember } from "@/lib/supabase"

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<(ProjectMember & { profile: any })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      const data = await ProjectsService.getProjectMembers(projectId)
      setMembers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch project members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [projectId])

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  }
}
