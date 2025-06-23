"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { OrganizationsService } from "@/lib/database/organizations"
import type { Organization } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Github, AlertCircle } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface OrganizationInvitePageProps {
  params: Promise<{
    slug: string
  }>
}

export default function OrganizationInvitePage({ params }: OrganizationInvitePageProps) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>("")
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Get params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    getParams()
  }, [params])

  // Check authentication and fetch organization
  useEffect(() => {
    if (!slug) return

    const getInitialData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check authentication status
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.log("Auth error (expected for unauthenticated users):", authError.message)
        }

        setUser(currentUser)
        setAuthChecked(true)

        // Fetch organization info (public method - no auth required)
        const org = await OrganizationsService.getOrganizationBySlugPublic(slug)
        if (org) {
          setOrganization(org)
        } else {
          setError("The organization you are trying to join does not exist.")
        }
      } catch (e: any) {
        console.error("Error fetching data:", e)
        setError("Failed to load organization details.")
      } finally {
        setLoading(false)
      }
    }

    getInitialData()
  }, [slug])

  // Auto-join if user is already authenticated
  useEffect(() => {
    if (authChecked && user && organization && !joining) {
      handleJoinOrganization()
    }
  }, [authChecked, user, organization])

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: window.location.href,
        },
      })

      if (error) {
        setError("Failed to sign in. Please try again.")
      }
    } catch (e: any) {
      setError("Failed to sign in. Please try again.")
    }
  }

  const handleJoinOrganization = async () => {
    if (!user || !organization) return

    setJoining(true)
    setError(null)

    try {
      // Check if user is already a member
      const isMember = await OrganizationsService.checkUserMembership(organization.id, user.id)

      if (isMember) {
        // User is already a member, redirect to organization page
        router.push(`/dashboard/organizations/${organization.slug}`)
        return
      }

      // Add user as a member
      await OrganizationsService.addOrganizationMember({
        organization_id: organization.id,
        user_id: user.id,
        role: "member",
      })

      // Redirect to organization page
      router.push(`/dashboard/organizations/${organization.slug}`)
    } catch (e: any) {
      console.error("Error joining organization:", e)
      setError("There was an error joining the organization. Please try again.")
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-48 mt-4" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <CardTitle>Unable to Join Organization</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!organization) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.avatar_url || ""} alt={organization.name} />
            <AvatarFallback className="text-lg">{organization.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4">Join {organization.name}</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join the <strong>{organization.name}</strong> organization.
            {organization.description && (
              <>
                <br />
                <span className="text-sm">{organization.description}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Signed in as <strong>{user.email}</strong>
              </div>
              <Button onClick={handleJoinOrganization} disabled={joining} className="w-full" size="lg">
                {joining ? "Joining..." : "Join Organization"}
              </Button>
            </div>
          ) : (
            <Button onClick={handleSignIn} className="w-full" size="lg">
              <Github className="mr-2 h-4 w-4" />
              Sign in with GitHub to Join
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
