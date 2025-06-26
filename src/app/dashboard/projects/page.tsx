"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useProjects } from "@/hooks/use-projects"
import { useOrganizations } from "@/hooks/use-organizations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  Calendar,
  Folder,
  Trash2,
  Edit,
  GitBranch,
  Sparkles,
  Github,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProfilesService } from "@/lib/database/profiles"

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, loading, error, createProject, deleteProject, refetch } = useProjects()
  const { organizations } = useOrganizations()
  const [searchTerm, setSearchTerm] = useState("")
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
  const [userRepos, setUserRepos] = useState<any[]>([])
  const [reposLoading, setReposLoading] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [repoMode, setRepoMode] = useState<"select" | "manual">("select")

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        owner_id: userProfile?.id,
        visibility: formData.visibility,
        github_repo_url: formData.github_repo_link,
        status: "active",
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
        router.push(`/dashboard/projects/${newProject.id}`)
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

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    const success = await deleteProject(projectId)
    if (success) {
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "private":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "internal":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  useEffect(() => {
    ProfilesService.getCurrentProfile().then((profile) => {
      setUserProfile(profile)
      if (profile?.github_username) {
        setReposLoading(true)
        const fetchUserRepos = async (username: string) => {
          const res = await fetch(`/api/github/user-repos?username=${username}`)
          if (!res.ok) throw new Error("Failed to fetch repos")
          return res.json()
        }
        fetchUserRepos(profile.github_username)
          .then((repos) => {
            setUserRepos(repos)
            setReposLoading(false)
          })
          .catch((err) => {
            setRepoError("Failed to fetch repos")
            setReposLoading(false)
          })
      }
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="p-6 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Folder className="h-12 w-12 text-red-600" />
        </div>
        <p className="text-red-600 text-lg mb-4">Error loading projects: {error}</p>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <GitBranch className="mr-3 h-10 w-10" />
                Projects
              </h1>
              <p className="text-emerald-100 text-lg">Manage and view all your projects</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 border-white/30 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleCreateProject}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-emerald-600" />
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
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, visibility: value as typeof prev.visibility }))
                          }
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
                      {userProfile?.github_username && repoMode === "select" ? (
                        <>
                          <div className="flex gap-2 items-center mb-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => setRepoMode("manual")}>
                              Enter URL manually
                            </Button>
                            <span className="text-xs text-muted-foreground">as {userProfile.github_username}</span>
                          </div>
                          {reposLoading ? (
                            <div className="text-sm text-muted-foreground">Loading repos...</div>
                          ) : repoError ? (
                            <div className="text-sm text-red-500">{repoError}</div>
                          ) : (
                            <Select
                              value={formData.github_repo_link}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, github_repo_link: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a repo or enter manually" />
                              </SelectTrigger>
                              <SelectContent>
                                {userRepos.map((repo: any) => (
                                  <SelectItem key={repo.id} value={repo.html_url}>
                                    {repo.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </>
                      ) : (
                        <>
                          {userProfile?.github_username && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="mb-2"
                              onClick={() => setRepoMode("select")}
                            >
                              Choose from your repos
                            </Button>
                          )}
                          <Input
                            id="github"
                            value={formData.github_repo_link}
                            onChange={(e) => setFormData((prev) => ({ ...prev, github_repo_link: e.target.value }))}
                            placeholder="https://github.com/user/repo"
                          />
                        </>
                      )}
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

      {/* Enhanced Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Folder className="h-12 w-12 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-slate-900">
            {searchTerm ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first project"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                      <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {project.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/projects/${project.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Unknown date"}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      <span>Team</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(project.status ?? "")}>{project.status ?? "Unknown"}</Badge>
                    <Badge className={getVisibilityColor(project.visibility ?? "")}>
                      {project.visibility ?? "Unknown"}
                    </Badge>
                  </div>
                  {project.organization && (
                    <div className="text-xs text-muted-foreground">
                      <Link
                        href={`/dashboard/organizations/${project.organization.slug}`}
                        className="hover:underline hover:text-emerald-600 transition-colors"
                      >
                        {project.organization.name}
                      </Link>
                    </div>
                  )}
                  {project.github_repo_url && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Github className="mr-1 h-3 w-3" />
                      <a
                        href={project.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 transition-colors truncate"
                      >
                        GitHub Repository
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
