"use client"

import { OrganizationSettingsTab } from "@/components/organizations/organization-settings-tab"
import { Organization } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { OrganizationsService } from "@/lib/database/organizations"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface OrganizationPageProps {
  params: {
    slug: string
  }
}

// We need a type that includes the user's role, which is added by our service
type OrganizationWithUserRole = Organization & { user_role?: string }

export default function OrganizationPage({ params }: OrganizationPageProps) {
  const { slug } = params
  const [organization, setOrganization] = useState<OrganizationWithUserRole | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizationData = async () => {
      setLoading(true)
      try {
        const org = await OrganizationsService.getOrganizationBySlug(slug)
        if (!org) {
          setError("Organization not found.")
          setLoading(false)
          return
        }

        // The user's role is not part of the base organization data.
        // We can get it by fetching the user's list of organizations, which includes their role in each.
        const userOrgs = await OrganizationsService.getUserOrganizations()
        const currentOrgWithRole = userOrgs.find(userOrg => userOrg.id === org.id)
        
        setOrganization(org)
        setUserRole((currentOrgWithRole as OrganizationWithUserRole)?.user_role || null)
        setError(null)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationData()
  }, [slug])


  const handleUpdateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return

    const updatedOrg = await OrganizationsService.updateOrganization(organization.id, updates)
    if (updatedOrg) {
      setOrganization(prev => prev ? { ...prev, ...updatedOrg } : updatedOrg)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
          <p className="text-muted-foreground">
            The organization you're looking for doesn't exist or you don't have access to it.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <OrganizationSettingsTab
      organization={organization}
      onUpdate={handleUpdateOrganization}
      userRole={userRole}
    />
  )
}
