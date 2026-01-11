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
import { Edit, Users, Globe, Lock, Eye, Github, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { ProjectMembersTab } from "./project-members-tab"
import { ProjectSettingsTab } from "./project-settings-tab"
import { ProjectTasksTab } from "./project-tasks-tab"
import { ProjectCalendarTab } from "./project-calendar-tab"
import { supabase } from "@/lib/supabase"
import { ProjectCommitsTab } from "./project-commit-page"
import { useTasks } from "@/hooks/use-tasks"

interface ProjectDetailPageProps {
  projectId: string
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const { project, loading, error } = useProject(projectId)
  const { members, loading: membersLoading } = useProjectMembers(projectId)
  const { tasks: allTasks, loading: tasksLoading } = useTasks(projectId)
  const [activeTab, setActiveTab] = useState("overview")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [commits, setCommits] = useState<any[]>([])
  const [commitsLoading, setCommitsLoading] = useState(false)
  const [commitsError, setCommitsError] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
        const github = repoUrl.replace("https://github.com/", "")
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto py-8 space-y-8">
          <div className="h-12 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="text-muted-foreground">
            {error || "The project you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link href="/projects">
            <Button className="w-full">Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      case "on_hold":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "archived":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
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

  const safeMembers = Array.isArray(members) ? members : []
  const userMember = currentUserId ? safeMembers.find((member) => member.user_id === currentUserId) : undefined
  const isOwner = currentUserId && project.owner_id === currentUserId
  const isAdmin = userMember && userMember.role === "admin"
  const canEdit = !!(isOwner || isAdmin)

  const taskList = Array.isArray(allTasks) ? allTasks : []
  const taskCount = taskList.length
  const completedTasks = taskList.filter((t: any) => t.status === "completed" || t.status === "closed").length
  let progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
  if (project.status === "completed") progress = 100

  const githubRepoUrl = (project as any).github_repo_url || (project as any).github_repo_link || ""

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-bold text-foreground">{project.name}</h1>
                  <Badge className={`${getStatusColor(project.status || "")} capitalize`}>{project.status}</Badge>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {project.description || "No description provided"}
                </p>
                {project.organization && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Organization:</span>
                    <Link
                      href={`/dashboard/organizations/${project.organization.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {project.organization.name}
                    </Link>
                  </div>
                )}
                {githubRepoUrl && (
                  <div className="flex items-center gap-2 pt-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                      title={githubRepoUrl}
                    >
                      {githubRepoUrl}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Link href={`/dashboard/projects/${project.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  {members.length}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-muted/50 border border-border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="commits">Commits</TabsTrigger>
              <TabsTrigger value="calander">Calendar</TabsTrigger>
              {canEdit && <TabsTrigger value="settings">Settings</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                          <p className="text-3xl font-bold text-foreground">{taskCount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Completed</p>
                          <p className="text-3xl font-bold text-emerald-600">{completedTasks}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Progress</p>
                          <p className="text-3xl font-bold text-primary">{progress}%</p>
                        </div>
                      </div>
                      <Separator className="bg-border/30" />
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Created</span>
                          <span className="font-medium">
                            {project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Last Updated</span>
                          <span className="font-medium">
                            {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Visibility</span>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(project.visibility || "")}
                            <span className="font-medium capitalize">{project.visibility}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {githubRepoUrl && (
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Github className="h-5 w-5" />
                          Recent Commits
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {commitsLoading && <p className="text-sm text-muted-foreground">Loading commits...</p>}
                        {commitsError && <p className="text-sm text-destructive">{commitsError}</p>}
                        {!commitsLoading && !commitsError && commits.length === 0 && (
                          <p className="text-sm text-muted-foreground">No commits found.</p>
                        )}
                        {!commitsLoading && !commitsError && commits.length > 0 && (
                          <ul className="space-y-3">
                            {commits.slice(0, 4).map((commit: any) => (
                              <li key={commit.sha}>
                                <a
                                  href={commit.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium text-sm block"
                                >
                                  {commit.commit.message.split("\n")[0]}
                                </a>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {commit.commit.author?.name} • {new Date(commit.commit.author?.date).toLocaleString()}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {membersLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {members.slice(0, 5).map((member) => (
                            <div key={member.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profile.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {member.profile.full_name?.charAt(0) || member.profile.email?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {member.profile.full_name || member.profile.email}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs ml-2">
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
                              View all {members.length}
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
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

            <TabsContent value="calander">
              <div className="overflow-hidden">
                <ProjectCalendarTab projectId={project.id} />
              </div>
            </TabsContent>

            <TabsContent value="commits">
              <ProjectCommitsTab commits={commits} />
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
    </div>
  )
}
