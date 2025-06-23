"use client"

import { useState, useEffect } from "react"
import { useProject } from "@/hooks/use-projects"
import { useProjectMembers } from "@/hooks/use-project-members"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, Users, Calendar, Globe, Lock, Eye, Github } from "lucide-react"
import Link from "next/link"
import { ProjectMembersTab } from "./project-members-tab"
import { ProjectSettingsTab } from "./project-settings-tab"
import { ProjectTasksTab } from "./project-tasks-tab"
import { supabase } from "@/lib/supabase"

interface ProjectDetailPageProps {
  projectId: string
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const { project, loading, error } = useProject(projectId)
  const { members, loading: membersLoading } = useProjectMembers(projectId)
  const [activeTab, setActiveTab] = useState("overview")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Fetch GitHub commits
  const [commits, setCommits] = useState<any[]>([])
  const [commitsLoading, setCommitsLoading] = useState(false)
  const [commitsError, setCommitsError] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    const fetchCommits = async (repoUrl: string) => {
      setCommitsLoading(true)
      setCommitsError(null)
      setCommits([])
      try {
        const github = repoUrl.replace('https://github.com/','')
        const url = `https://api.github.com/repos/${github}/commits`
        const res = await fetch(url, {
          headers: { Accept: "application/vnd.github.v3+json" },
        })
        if (!res.ok) throw new Error(`Failed to fetch commits: ${res.statusText}`)
        const data = await res.json()
        setCommits(data)
      } catch (e: any) {
        setCommitsError(e.message || "Failed to fetch commits.")
      } finally {
        setCommitsLoading(false)
      }
    }
    if (project && project.github_repo_url) {
      fetchCommits(project.github_repo_url)
    }
  }, [project])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The project you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "private":
        return <Lock className="h-4 w-4" />
      case "internal":
        return <Eye className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  // Only allow edit if current user is owner or has admin role
  // (Assume member.role === 'admin' means admin)
  const safeMembers = Array.isArray(members) ? members : []
  const userMember = currentUserId ? safeMembers.find((member) => member.user_id === currentUserId) : undefined
  const isOwner = currentUserId && project.owner_id === currentUserId
  const isAdmin = userMember && userMember.role === "admin"
  const canEdit = !!(isOwner || isAdmin)

  // Count tasks and progress (always use project.tasks)
  const taskList = Array.isArray((project as any).tasks) ? (project as any).tasks : []
  const taskCount = taskList.length
  const completedTasks = taskList.filter((t: any) => t.status === "completed" || t.status === "closed").length
  let progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
  if ((project as any).status === "completed") progress = 100

  // Github repo url
  const githubRepoUrl = (project as any).github_repo_url || (project as any).github_repo_link || ""

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge className={getStatusColor(project.status || "")}>{project.status}</Badge>
            </div>
            <p className="text-muted-foreground">{project.description || "No description provided"}</p>
            {project.organization && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <span>in</span>
                <Link href={`/dashboard/organizations/${project.organization.slug}`} className="hover:underline font-medium">
                  {project.organization.name}
                </Link>
              </div>
            )}
            {githubRepoUrl && (
              <div className="flex items-center space-x-2 mt-1">
                <Github className="h-4 w-4 text-muted-foreground" />
                <a
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                  title={githubRepoUrl}
                >
                  {githubRepoUrl}
                </a>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <Link href={`/dashboard/projects/${project.id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
            )}
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              {members.length} Members
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {canEdit && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm">{project.description || "No description provided"}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                        <Badge className={getStatusColor(project.status || "")}>{project.status}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Visibility</h4>
                        <div className="flex items-center space-x-1">
                          {getVisibilityIcon(project.visibility || "")}
                          <span className="text-sm capitalize">{project.visibility}</span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-1">Created</h4>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-1">Last Updated</h4>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Team Members</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {membersLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {members.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.profile.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {member.profile.full_name?.charAt(0) || member.profile.email?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{member.profile.full_name || member.profile.email}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                        {members.length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => setActiveTab("members")}
                          >
                            View all {members.length} members
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity - Commits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {githubRepoUrl ? (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Recent GitHub Commits</h4>
                        {commitsLoading && <p className="text-sm text-muted-foreground">Loading commits...</p>}
                        {commitsError && <p className="text-sm text-destructive">{commitsError}</p>}
                        {!commitsLoading && !commitsError && commits.length === 0 && (
                          <p className="text-sm text-muted-foreground">No commits found.</p>
                        )}
                        {!commitsLoading && !commitsError && commits.length > 0 && (
                          <ul className="space-y-2">
                            {commits.slice(0, 5).map((commit: any) => (
                              <li key={commit.sha} className="border-b pb-2 last:border-b-0 last:pb-0">
                                <a
                                  href={commit.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  {commit.commit.message.split("\n")[0]}
                                </a>
                                <div className="text-xs text-muted-foreground">
                                  {commit.commit.author?.name} &middot; {new Date(commit.commit.author?.date).toLocaleString()}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </CardContent>
                </Card>

                {/* Project Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasks</span>
                      <span>{taskCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span>{members.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{progress}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <ProjectTasksTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="members">
            <ProjectMembersTab
              projectId={project.id}
              userRole={userMember?.role || "viewer"}
              organizationId={project.organization_id}
              projectOwnerId={project.owner_id}
              currentUserId={currentUserId}
            />
          </TabsContent>

          {canEdit && (
            <TabsContent value="settings">
              <ProjectSettingsTab
                project={project}
                userRole={userMember?.role || "viewer"}
                members={safeMembers}
                currentUserId={currentUserId}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
