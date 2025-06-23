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
import { Plus, Search, MoreHorizontal, Users, Calendar, Folder, Trash2, Edit } from "lucide-react"
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
  const [repoMode, setRepoMode] = useState<'select' | 'manual'>("select")

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
        owner_id: userProfile?.id, // Fix: add required owner_id field
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
          github_repo_link: "https://github.com/user/example"
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

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-blue-100 text-blue-800"
      case "private":
        return "bg-purple-100 text-purple-800"
      case "internal":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    ProfilesService.getCurrentProfile().then(profile => {
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
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
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
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-red-600">Error loading projects: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and view all your projects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project to organize your work and collaborate with your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                <div className="space-y-2">
                  <Label htmlFor="github">Github repo link</Label>
                  {userProfile?.github_username && repoMode === "select" ? (
                    <>
                      <div className="flex gap-2 items-center mb-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setRepoMode("manual")}>Enter URL manually</Button>
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
                        <Button type="button" size="sm" variant="outline" className="mb-2" onClick={() => setRepoMode("select")}>Choose from your repos</Button>
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first project"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">
                      <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Unknown date"}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {/* This would show member count - we'll add this later */}
                      <span>Team</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(project.status ?? "")}>{project.status ?? "Unknown"}</Badge>
                    <Badge className={getVisibilityColor(project.visibility ?? "")}>{project.visibility ?? "Unknown"}</Badge>
                  </div>
                  {project.organization && (
                    <div className="text-xs text-muted-foreground">
                      <Link href={`/dashboard/organizations/${project.organization.slug}`} className="hover:underline">
                        {project.organization.name}
                      </Link>
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
