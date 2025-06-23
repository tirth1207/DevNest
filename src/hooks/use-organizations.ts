"use client"

import { useState, useEffect } from "react"
import { OrganizationsService } from "@/lib/database/organizations"
import { supabase, type Organization, type OrganizationMember } from "@/lib/supabase"

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const data = await OrganizationsService.getUserOrganizations()
      setOrganizations(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch organizations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const createOrganization = async (orgData: Omit<Organization, "id" | "created_at" | "updated_at">) => {
    const newOrg = await OrganizationsService.createOrganization(orgData)
    if (newOrg) {
      setOrganizations((prev) => [newOrg, ...prev])
    }
    return newOrg
  }

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    const updatedOrg = await OrganizationsService.updateOrganization(id, updates)
    if (updatedOrg) {
      setOrganizations((prev) => prev.map((org) => (org.id === id ? updatedOrg : org)))
    }
    return updatedOrg
  }

  const deleteOrganization = async (id: string) => {
    const success = await OrganizationsService.deleteOrganization(id)
    if (success) {
      setOrganizations((prev) => prev.filter((org) => org.id !== id))
    }
    return success
  }

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  }
}

export function useOrganizationMembers(organizationId: string) {
  const [members, setMembers] = useState<(OrganizationMember & { profile: any })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!organizationId) return

    const fetchMembers = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("organization_members")
          .select(
            `
            *,
            profile:profiles!organization_members_user_id_fkey(
              id,
              email,
              full_name,
              avatar_url,
              github_username
            )
          `,
          )
          .eq("organization_id", organizationId)
          .order("joined_at", { ascending: false })

        if (error) {
          console.error("Error fetching organization members:", error)
          setError(error.message)
        } else {
          setMembers(data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch members")
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [organizationId])

  return { members, loading, error }
}