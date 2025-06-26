"use client"

import { useOrganizations } from "@/hooks/use-organizations"
import { useProjects } from "@/hooks/use-projects"
import { useUserTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset } from "@/components/ui/sidebar"
import Link from "next/link"
import { Activity, Users, GitBranch, CheckCircle, Clock, Plus, TrendingUp, Calendar, Star, Zap, Sparkles, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function Page() {
  const { organizations, loading: orgsLoading } = useOrganizations()
  const { projects, loading: projectsLoading, createProject } = useProjects()
  const { tasks, loading: tasksLoading } = useUserTasks()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    organization_id: "",
    visibility: "private" as const,
    github_repo_link: "",
  })
  const [userProfile, setUserProfile] = useState<any>(null)
  const [repoMode, setRepoMode] = useState<"select" | "manual">("manual")

  // Calculate stats
  const activeProjects = projects?.filter((p) => p.status === "active").length || 0
  const teamMembers = 1
  const completedTasks = tasks?.filter((t) => t.status === "closed").length || 0
  const pendingTasks = tasks?.filter((t) => t.status === "open" || t.status === "in_progress").length || 0

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.organization_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    setIsCreating(true)
    try {
      const newProject = await createProject({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        organization_id: formData.organization_id,
        visibility: formData.visibility,
        github_repo_url: formData.github_repo_link,
        status: "active",
        owner_id: userProfile?.id,
      })
      if (newProject) {
        toast({
          title: "Success",
          description: "Project created successfully",
        })
        setIsCreateDialogOpen(false)
        setFormData({
          name: "",
          slug: "",
          description: "",
          organization_id: "",
          visibility: "private",
          github_repo_link: "",
        })
        window.location.href = `/dashboard/projects/${newProject.id}`
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <SidebarInset>
      <div className="flex-1 min-h-screen space-y-8">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
                <p className="text-blue-100 text-lg">{"Here's what's happening with your projects today."}</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
                  <div className="text-blue-200 text-sm">Today</div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white/20 hover:bg-white/30 border-white/30">
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <form onSubmit={handleCreateProject}>
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                          Create New Project
                        </DialogTitle>
                        <DialogDescription>
                          Create a new project to organize your work and collaborate with your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="organization">Organization *</Label>
                            <Select
                              value={formData.organization_id}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, organization_id: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select organization" />
                              </SelectTrigger>
                              <SelectContent>
                                {organizations.map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="visibility">Visibility</Label>
                            <Select
                              value={formData.visibility}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, visibility: value as typeof prev.visibility }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Project Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Enter project name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="slug">Project Slug</Label>
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                            placeholder="project-slug"
                          />
                          <p className="text-sm text-muted-foreground">This will be used in the project URL</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter project description"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github" className="flex items-center">
                            <Github className="mr-2 h-4 w-4" />
                            GitHub Repository
                          </Label>
                          <Input
                            id="github"
                            value={formData.github_repo_link}
                            onChange={(e) => setFormData((prev) => ({ ...prev, github_repo_link: e.target.value }))}
                            placeholder="https://github.com/user/repo"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                          {isCreating ? "Creating..." : "Create Project"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <GitBranch className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">{activeProjects}</div>
              )}
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Projects in progress
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Team Members</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{teamMembers}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed Tasks</CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">{completedTasks}</div>
              )}
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Tasks completed
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Tasks</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">{pendingTasks}</div>
              )}
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Tasks assigned to you
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Projects */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Recent Projects</CardTitle>
                  <CardDescription>Your most recently updated projects</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/projects">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="group p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                          <GitBranch className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors group-hover:text-blue-600"
                          >
                            {project.name}
                          </Link>
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {project.description || "No description"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Updated{" "}
                              {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "recently"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={project.status === "active" ? "default" : "secondary"}
                            className={
                              project.status === "active" ? "bg-green-100 text-green-800 border-green-200" : ""
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <GitBranch className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 mb-4">No projects yet</p>
                    <Button asChild>
                      <Link href="/dashboard/projects/new">Create your first project</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Recent Tasks</CardTitle>
              <CardDescription>Your latest task updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tasks && tasks.length > 0 ? (
                  tasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className="group p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-1.5 rounded-lg ${
                            task.status === "closed"
                              ? "bg-green-100"
                              : task.status === "in_progress"
                                ? "bg-yellow-100"
                                : "bg-blue-100"
                          }`}
                        >
                          {task.status === "closed" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : task.status === "in_progress" ? (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Activity className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">{task.title}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500">{task.project?.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                task.priority === "critical"
                                  ? "border-red-200 text-red-700 bg-red-50"
                                  : task.priority === "high"
                                    ? "border-orange-200 text-orange-700 bg-orange-50"
                                    : "border-slate-200 text-slate-600 bg-slate-50"
                              }`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="p-3 bg-slate-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No tasks yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
