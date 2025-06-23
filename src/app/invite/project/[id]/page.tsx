"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ProjectsService } from "@/lib/database/projects"
import type { Project } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Github, AlertCircle } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface ProjectInvitePageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProjectInvitePage({ params }: ProjectInvitePageProps) {
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>("")
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Get params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProjectId(resolvedParams.id)
    }
    getParams()
  }, [params])

  // Check authentication and fetch project
  useEffect(() => {
    if (!projectId) return

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

        // Fetch project info (public method - no auth required)
        const proj = await ProjectsService.getProjectById(projectId)
        if (proj) {
          setProject(proj)
        } else {
          setError("The project you are trying to join does not exist.")
        }
      } catch (e: any) {
        console.error("Error fetching data:", e)
        setError("Failed to load project details.")
      } finally {
        setLoading(false)
      }
    }

    getInitialData()
  }, [projectId])

  // Auto-join if user is already authenticated
  useEffect(() => {
    if (authChecked && user && project && !joining) {
      handleJoinProject()
    }
  }, [authChecked, user, project])

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

  const handleJoinProject = async () => {
    if (!user || !project) return

    setJoining(true)
    setError(null)

    try {
      // Check if user is already a member
      const members = await ProjectsService.getProjectMembers(project.id)
      const isMember = members.some((m) => m.user_id === user.id)

      if (isMember) {
        // User is already a member, redirect to project page
        router.push(`/dashboard/projects/${project.id}`)
        return
      }

      // Add user as a member (default role: read)
      await ProjectsService.addProjectMember({
        project_id: project.id,
        user_id: user.id,
        role: "read",
      })

      // Redirect to project page
      router.push(`/dashboard/projects/${project.id}`)
    } catch (e: any) {
      console.error("Error joining project:", e)
      setError("There was an error joining the project. Please try again.")
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
            <CardTitle>Unable to Join Project</CardTitle>
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

  if (!project) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={project.organization?.avatar_url || ""} alt={project.name} />
            <AvatarFallback className="text-lg">{project.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4">Join {project.name}</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join the <strong>{project.name}</strong> project.
            {project.description && (
              <>
                <br />
                <span className="text-sm">{project.description}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!user && (
            <Button onClick={handleSignIn} className="w-full" size="lg">
              <Github className="mr-2 h-5 w-5" />
              Sign in with GitHub to join
            </Button>
          )}
          {user && joining && (
            <Button disabled className="w-full" size="lg">
              Joining project...
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
