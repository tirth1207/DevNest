"use client"

import { useOrganizations } from "@/hooks/use-organizations"
import { useProjects } from "@/hooks/use-projects"
import { useUserTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset } from "@/components/ui/sidebar"
import Link from "next/link"
import { Activity, Users, GitBranch, CheckCircle, Clock, Plus, TrendingUp, Calendar, Star, Zap, Sparkles, Github, Building2, Globe, Lock, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { ProfilesService } from "@/lib/database/profiles"

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
  const [userRepos, setUserRepos] = useState<any[]>([])
  const [reposLoading, setReposLoading] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await ProfilesService.getCurrentProfile()
        setUserProfile(profile)
        if (profile?.github_username) {
          setReposLoading(true)
          try {
            const res = await fetch(`/api/github/user-repos?username=${profile.github_username}`)
            if (res.ok) {
              const repos = await res.json()
              setUserRepos(repos)
            } else {
              setRepoError("Failed to fetch repositories")
            }
          } catch (error) {
            setRepoError("Failed to fetch repositories")
          } finally {
            setReposLoading(false)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      }
    }
    fetchUserProfile()
  }, [])

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
    // Clear error when user starts typing
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: "" }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) {
      errors.name = "Project name is required"
    }
    if (!formData.organization_id) {
      errors.organization_id = "Organization is required"
    }
    if (formData.github_repo_link && !formData.github_repo_link.match(/^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+$/)) {
      errors.github_repo_link = "Please enter a valid GitHub repository URL"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
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
        setFormErrors({})
        setIsCreateDialogOpen(false)
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
    <div className="flex-1 space-y-8 ">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-blue-100 text-lg">{"Here's what's happening with your projects today."}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="hidden md:flex items-center space-x-4 text-right">
                <div>
                  <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <div className="text-blue-200 text-sm">Today</div>
                </div>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                  <DialogContent className="lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleCreateProject} className="max-w-7xl">
                      <DialogHeader className="space-y-3 pb-4 border-b">
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                          <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          Create New Project
                        </DialogTitle>
                        <DialogDescription className="text-base">
                          Set up a new project to organize your work, track progress, and collaborate with your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-6">
                        {/* Organization & Visibility */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="organization" className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              Organization *
                            </Label>
                            <Select
                              value={formData.organization_id}
                              onValueChange={(value) => {
                                setFormData((prev) => ({ ...prev, organization_id: value }))
                                if (formErrors.organization_id) {
                                  setFormErrors((prev) => ({ ...prev, organization_id: "" }))
                                }
                              }}
                            >
                              <SelectTrigger className={formErrors.organization_id ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select organization" />
                              </SelectTrigger>
                              <SelectContent>
                                {organizations.length === 0 ? (
                                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                    No organizations available
                                  </div>
                                ) : (
                                  organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                      {org.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {formErrors.organization_id && (
                              <p className="text-sm text-destructive">{formErrors.organization_id}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="visibility" className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              Visibility
                            </Label>
                            <Select
                              value={formData.visibility}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, visibility: value as typeof prev.visibility }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="private">
                                  <div className="flex items-center gap-2">
                                    <Lock className="h-3 w-3" />
                                    <span>Private</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="internal">
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-3 w-3" />
                                    <span>Internal</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="public">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" />
                                    <span>Public</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {formData.visibility === "private" ? "Only organization members can view" :
                               formData.visibility === "internal" ? "Visible to organization members" :
                               formData.visibility === "public" ? "Visible to everyone" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Project Name */}
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            Project Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="My Awesome Project"
                            className={formErrors.name ? "border-destructive" : ""}
                            required
                          />
                          {formErrors.name && (
                            <p className="text-sm text-destructive">{formErrors.name}</p>
                          )}
                        </div>

                        {/* Project Slug */}
                        <div className="space-y-2">
                          <Label htmlFor="slug">Project Slug</Label>
                          <div className="relative">
                            <Input
                              id="slug"
                              value={formData.slug}
                              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                              placeholder="my-awesome-project"
                              className="font-mono"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            URL: <span className="font-mono">/dashboard/projects/{formData.slug || "project-slug"}</span>
                          </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => {
                              const value = e.target.value.slice(0, 500)
                              setFormData((prev) => ({ ...prev, description: value }))
                            }}
                            placeholder="A brief description of your project..."
                            rows={3}
                            className="resize-none"
                            maxLength={500}
                          />
                          <p className={`text-xs ${formData.description.length >= 450 ? "text-amber-500" : "text-muted-foreground"}`}>
                            {formData.description.length}/500 characters
                          </p>
                        </div>

                        {/* GitHub Repository */}
                        <div className="space-y-2">
                          <Label htmlFor="github" className="flex items-center gap-2">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            GitHub Repository
                            <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                          </Label>
                          {userProfile?.github_username && repoMode === "select" ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setRepoMode("manual")}
                                  className="text-xs"
                                >
                                  Enter URL manually
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  Connected as <span className="font-medium">{userProfile.github_username}</span>
                                </span>
                              </div>
                              {reposLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading repositories...
                                </div>
                              ) : repoError ? (
                                <div className="text-sm text-destructive py-2">{repoError}</div>
                              ) : (
                                <Select
                                  value={formData.github_repo_link}
                                  onValueChange={(value) => {
                                    setFormData((prev) => ({ ...prev, github_repo_link: value }))
                                    if (formErrors.github_repo_link) {
                                      setFormErrors((prev) => ({ ...prev, github_repo_link: "" }))
                                    }
                                  }}
                                >
                                  <SelectTrigger className={formErrors.github_repo_link ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select a repository" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {userRepos.length === 0 ? (
                                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                        No repositories found
                                      </div>
                                    ) : (
                                      userRepos.map((repo: any) => (
                                        <SelectItem key={repo.id} value={repo.html_url}>
                                          <div className="flex items-center gap-2">
                                            <Github className="h-3 w-3" />
                                            <span>{repo.full_name}</span>
                                            {repo.private && <Lock className="h-3 w-3 text-muted-foreground" />}
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {userProfile?.github_username && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRepoMode("select")
                                    setReposLoading(true)
                                    fetch(`/api/github/user-repos?username=${userProfile.github_username}`)
                                      .then((res) => res.json())
                                      .then((repos) => {
                                        setUserRepos(repos)
                                        setReposLoading(false)
                                      })
                                      .catch(() => {
                                        setRepoError("Failed to fetch repositories")
                                        setReposLoading(false)
                                      })
                                  }}
                                  className="mb-2"
                                >
                                  <Github className="mr-2 h-3 w-3" />
                                  Choose from your repositories
                                </Button>
                              )}
                              <Input
                                id="github"
                                value={formData.github_repo_link}
                                onChange={(e) => {
                                  setFormData((prev) => ({ ...prev, github_repo_link: e.target.value }))
                                  if (formErrors.github_repo_link) {
                                    setFormErrors((prev) => ({ ...prev, github_repo_link: "" }))
                                  }
                                }}
                                placeholder="https://github.com/username/repository"
                                className={formErrors.github_repo_link ? "border-destructive" : ""}
                              />
                              {formErrors.github_repo_link && (
                                <p className="text-sm text-destructive">{formErrors.github_repo_link}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter className="border-t pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateDialogOpen(false)
                            setFormErrors({})
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || orgsLoading}>
                          {isCreating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Create Project
                            </>
                          )}
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
          <Card className="relative overflow-hidden border shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <GitBranch className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{activeProjects}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Projects in progress
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{teamMembers}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{completedTasks}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Tasks completed
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{pendingTasks}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Tasks assigned to you
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Projects */}
          <Card className="lg:col-span-2 border shadow-lg bg-card/80 backdrop-blur-sm">
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
                      className="group p-4 rounded-xl border border-border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 bg-card/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                          <GitBranch className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="text-lg font-semibold text-foreground hover:text-blue-600 transition-colors group-hover:text-blue-600"
                          >
                            {project.name}
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description || "No description"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
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
                    <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <GitBranch className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No projects yet</p>
                    <Button asChild>
                      <Link href="/dashboard/projects/new">Create your first project</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
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
                      className="group p-3 rounded-lg border border-border hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-1.5 rounded-lg ${task.status === "closed"
                            ? "bg-green-100"
                            : task.status === "in_progress"
                              ? "bg-yellow-100"
                              : "bg-blue-100 dark:bg-blue-900/50"
                            }`}
                        >
                          {task.status === "closed" ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : task.status === "in_progress" ? (
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">{task.project?.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${task.priority === "critical"
                                ? "border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                : task.priority === "high"
                                  ? "border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                  : "border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700"
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
                    <div className="p-3 bg-muted rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">No tasks yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
