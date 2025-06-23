"use client"

import { useState, useEffect } from "react"
import { ProfilesService } from "@/lib/database/profiles"
import { OrganizationsService } from "@/lib/database/organizations"
import { ProjectsService } from "@/lib/database/projects"
import { supabase } from "@/lib/supabase"
import type { Profile, Organization, Project } from "@/lib/supabase"

interface SidebarData {
  user: Profile | null
  organizations: Organization[]
  projects: Project[]
  currentOrg: Organization | null
  loading: boolean
  error: string | null
}

export function useSidebarData() {
  const [data, setData] = useState<SidebarData>({
    user: null,
    organizations: [],
    projects: [],
    currentOrg: null,
    loading: true,
    error: null,
  })

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }))

      // Check if user is authenticated
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setData((prev) => ({ ...prev, loading: false }))
        return
      }

      // Fetch all data in parallel
      const [profile, userOrgs, userProjects] = await Promise.all([
        ProfilesService.getCurrentProfile(),
        OrganizationsService.getUserOrganizations(),
        ProjectsService.getUserProjects(),
      ])

      // Get current organization from localStorage or use first one
      const savedOrgId = localStorage.getItem("currentOrganizationId")
      let currentOrg = null

      if (savedOrgId && userOrgs.length > 0) {
        currentOrg = userOrgs.find((org) => org.id === savedOrgId) || userOrgs[0]
      } else if (userOrgs.length > 0) {
        currentOrg = userOrgs[0]
      }

      // Save current org to localStorage
      if (currentOrg) {
        localStorage.setItem("currentOrganizationId", currentOrg.id)
      }

      setData({
        user: profile,
        organizations: userOrgs,
        projects: userProjects,
        currentOrg,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error fetching sidebar data:", error)
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      }))
    }
  }

  const switchOrganization = (orgId: string) => {
    const org = data.organizations.find((o) => o.id === orgId)
    if (org) {
      setData((prev) => ({ ...prev, currentOrg: org }))
      localStorage.setItem("currentOrganizationId", orgId)
    }
  }

  const refreshData = () => {
    fetchData()
  }

  useEffect(() => {
    fetchData()

    // Set up real-time subscriptions for data changes
    const profileSubscription = supabase
      .channel("profile_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        refreshData()
      })
      .subscribe()

    const orgSubscription = supabase
      .channel("org_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "organizations" }, () => {
        refreshData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "organization_members" }, () => {
        refreshData()
      })
      .subscribe()

    const projectSubscription = supabase
      .channel("project_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        refreshData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "project_members" }, () => {
        refreshData()
      })
      .subscribe()

    return () => {
      profileSubscription.unsubscribe()
      orgSubscription.unsubscribe()
      projectSubscription.unsubscribe()
    }
  }, [])

  return {
    ...data,
    switchOrganization,
    refreshData,
  }
}
