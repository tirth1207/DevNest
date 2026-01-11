"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/hooks/use-projects"
import { ProjectsService } from "@/lib/database/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import type { Project } from "@/lib/supabase"

interface ProjectEditPageProps {
  projectId: string
}

export function ProjectEditPage({ projectId }: ProjectEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { project, loading, error } = useProject(projectId)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as Project["status"],
    visibility: "private" as Project["visibility"],
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        status: project.status,
        visibility: project.visibility,
      })
    }
  }, [project])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const updated = await ProjectsService.updateProject(projectId, formData)
      if (updated) {
        toast({
          title: "Success",
          description: "Project updated successfully.",
        })
        router.push(`/projects/${projectId}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 py-8">
        <div className="container mx-auto space-y-6">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="text-muted-foreground">{error || "The project you're looking for doesn't exist."}</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href={`/projects/${projectId}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Edit Project</h1>
              <p className="text-muted-foreground">Update your project details</p>
            </div>
          </div>

          {/* Edit Form */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Configure your project settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Project["status"] })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-base">
                    Visibility
                  </Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => setFormData({ ...formData, visibility: value as Project["visibility"] })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Link href={`/projects/${projectId}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
