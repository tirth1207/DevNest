"use client"

import { OrganizationSettingsTab } from "@/components/organizations/organization-settings-tab"
import { Organization } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { OrganizationsService } from "@/lib/database/organizations"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

type OrganizationWithUserRole = Organization & { user_role?: string }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Fetch organization and user role server-side
  const org = await OrganizationsService.getOrganizationBySlug(slug)
  if (!org) {
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
  // The user's role is not part of the base organization data.
  // We can get it by fetching the user's list of organizations, which includes their role in each.
  const userOrgs = await OrganizationsService.getUserOrganizations()
  const currentOrgWithRole = userOrgs.find(userOrg => userOrg.id === org.id)
  const userRole = (currentOrgWithRole as OrganizationWithUserRole)?.user_role || null
  return (
    <OrganizationSettingsTab
      organization={org}
      onUpdate={async (updates) => {
        // This will not update the UI immediately, but is fine for server components
        await OrganizationsService.updateOrganization(org.id, updates)
      }}
      userRole={userRole}
    />
  )
}
