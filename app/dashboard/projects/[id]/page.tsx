import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitBranch, Users, Calendar, Plus, Settings, FileText, CheckSquare } from "lucide-react"
import Link from "next/link"
import { AIAssistant } from "@/components/ai/ai-assistant"
import { GitHubIntegration } from "@/components/github/github-integration"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createClient()

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      organization:organizations(name),
      owner:profiles!projects_owner_id_fkey(full_name, email, avatar_url)
    `)
    .eq("id", params.id)
    .single()

  if (!project) {
    notFound()
  }

  // Get project members
  const { data: members } = await supabase
    .from("project_members")
    .select(`
      *,
      user:profiles(full_name, email, avatar_url)
    `)
    .eq("project_id", params.id)

  // Get recent tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(full_name, avatar_url),
      reporter:profiles!tasks_reporter_id_fkey(full_name)
    `)
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent pages
  const { data: pages } = await supabase
    .from("pages")
    .select(`
      *,
      author:profiles!pages_author_id_fkey(full_name)
    `)
    .eq("project_id", params.id)
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(5)

  // Get task stats
  const { data: taskStats } = await supabase.from("tasks").select("status").eq("project_id", params.id)

  const todoCount = taskStats?.filter((t) => t.status === "todo").length || 0
  const inProgressCount = taskStats?.filter((t) => t.status === "in_progress").length || 0
  const doneCount = taskStats?.filter((t) => t.status === "done").length || 0

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
            {project.github_repo_url && (
              <>
                <span>•</span>
                <a
                  href={project.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <GitBranch className="h-3 w-3" />
                  GitHub
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${params.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active collaborators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Todo Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoCount}</div>
            <p className="text-xs text-muted-foreground">Tasks to be started</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Tasks being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneCount}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant */}
      <div className="grid gap-4 md:grid-cols-2">
        <AIAssistant projectId={params.id} context="general" />
        <GitHubIntegration projectId={params.id} currentRepoUrl={project.github_repo_url} />
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Tasks */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Latest task updates in this project</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/dashboard/projects/${params.id}/tasks/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <Link
                        href={`/dashboard/projects/${params.id}/tasks/${task.id}`}
                        className="text-sm font-medium leading-none hover:underline"
                      >
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.status === "done" ? "default" : task.status === "in_progress" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant={
                            task.priority === "urgent"
                              ? "destructive"
                              : task.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    {task.assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{task.assignee.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No tasks yet</p>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/projects/${params.id}/tasks/new`}>Create your first task</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team & Documentation */}
        <div className="col-span-3 space-y-4">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People working on this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members?.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {member.user.full_name?.charAt(0) || member.user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.user.full_name || member.user.email}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No team members yet</p>}
              </div>
            </CardContent>
          </Card>

          {/* Recent Documentation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentation</CardTitle>
                  <CardDescription>Recent pages and docs</CardDescription>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/projects/${params.id}/docs/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Page
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pages && pages.length > 0 ? (
                  pages.map((page) => (
                    <div key={page.id} className="space-y-1">
                      <Link
                        href={`/dashboard/projects/${params.id}/docs/${page.id}`}
                        className="text-sm font-medium hover:underline flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {page.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        by {page.author.full_name} • {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">No documentation yet</p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/projects/${params.id}/docs/new`}>Create first page</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
