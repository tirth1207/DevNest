"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OrganizationsService } from "@/lib/database/organizations"
import { useOrganizationMembers } from "@/hooks/use-organizations"
import type { Organization } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Edit, Settings, Users, ArrowLeft, Globe } from "lucide-react"
import { OrganizationEditForm } from "@/components/organizations/organization-edit-form"
import { OrganizationMembersTab } from "@/components/organizations/organization-members-tab"
import { OrganizationSettingsTab } from "@/components/organizations/organization-settings-tab"

interface OrganizationDetailPageProps {
  slug: string
}

export function OrganizationDetailPage({ slug }: OrganizationDetailPageProps) {
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const { members, loading: membersLoading } = useOrganizationMembers(organization?.id || "")

  useEffect(() => {
    fetchOrganization()
  }, [slug])

  useEffect(() => {
    // Refresh members when organization changes
    if (organization?.id) {
      // The hook will automatically refetch when organizationId changes
    }
  }, [organization?.id])

  // Add a manual refresh function
  const refreshMembers = () => {
    if (organization?.id) {
      // Force a page refresh to get updated members
      window.location.reload()
    }
  }

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      const org = await OrganizationsService.getOrganizationBySlug(slug)

      if (!org) {
        setError("Organization not found")
        return
      }

      setOrganization(org)

      // Get user's role in this organization
      const role = await OrganizationsService.getUserRoleInOrganization(org.id)
      setUserRole(role)

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch organization")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return

    const updatedOrg = await OrganizationsService.updateOrganization(organization.id, updates)
    if (updatedOrg) {
      setOrganization(updatedOrg)
      setIsEditing(false)
    }
  }

  const canEdit = userRole === "owner" || userRole === "admin"
  const canManageMembers = userRole === "owner" || userRole === "admin"

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The organization you're looking for doesn't exist or you don't have access to it."}
            </p>
            <Button onClick={() => router.push("/dashboard/organizations")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="container mx-auto py-6">
        <OrganizationEditForm
          organization={organization}
          onSave={handleUpdateOrganization}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/organizations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={organization.avatar_url || ""} alt={organization.name} />
              <AvatarFallback className="text-lg">{organization.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              <p className="text-muted-foreground">{organization.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">@{organization.slug}</Badge>
                {userRole && (
                  <Badge variant="outline" className="capitalize">
                    {userRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {canEdit && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Organization
          </Button>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members ({members.length})
          </TabsTrigger>
          {canEdit && (
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Basic information about this organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{organization.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm font-mono">@{organization.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{organization.description || "No description provided"}</p>
                </div>
                {organization.github_org_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">GitHub Organization</label>
                    <p className="text-sm">
                      <a
                        href={`https://github.com/${organization.github_org_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        {organization.github_org_name}
                      </a>
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{new Date(organization.created_at || "").toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Overview of organization activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Members</span>
                  <Badge variant="secondary">{members.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Your Role</span>
                  <Badge variant="outline" className="capitalize">
                    {userRole || "Not a member"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Visibility</span>
                  <Badge variant="secondary">{organization.settings?.visibility || "Private"}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <OrganizationMembersTab
            organizationSlug={organization.slug}
            members={members}
            loading={membersLoading}
            canManage={canManageMembers}
            currentUserRole={userRole}
            onRefresh={refreshMembers}
          />
        </TabsContent>

        {canEdit && (
          <TabsContent value="settings">
            <OrganizationSettingsTab
              organization={organization}
              onUpdate={handleUpdateOrganization}
              userRole={userRole}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
