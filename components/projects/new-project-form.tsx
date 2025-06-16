"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function NewProjectForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as const,
    github_repo_url: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // First, get or create a default organization for the user
      const { data: organizations } = await supabase.from("organizations").select("*").eq("owner_id", user.id).limit(1)

      let organizationId: string

      if (!organizations || organizations.length === 0) {
        // Create a default organization
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: `${user.user_metadata?.full_name || user.email}'s Organization`,
            slug: `${user.id.slice(0, 8)}-org`,
            owner_id: user.id,
          })
          .select()
          .single()

        if (orgError) throw orgError
        organizationId = newOrg.id

        // Add user as organization member
        await supabase.from("organization_members").insert({
          organization_id: organizationId,
          user_id: user.id,
          role: "owner",
          joined_at: new Date().toISOString(),
        })
      } else {
        organizationId = organizations[0].id
      }

      // Create the project
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          organization_id: organizationId,
          name: formData.name,
          description: formData.description,
          slug,
          status: formData.status,
          github_repo_url: formData.github_repo_url || null,
          owner_id: user.id,
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Add user as project admin
      await supabase.from("project_members").insert({
        project_id: project.id,
        user_id: user.id,
        role: "admin",
        added_at: new Date().toISOString(),
      })

      // Create activity log
      await supabase.from("activities").insert({
        organization_id: organizationId,
        project_id: project.id,
        actor_id: user.id,
        activity_type: "project_created",
        entity_type: "project",
        entity_id: project.id,
        metadata: { project_name: project.name },
      })

      toast({
        title: "Project created successfully!",
        description: `${formData.name} has been created and you can start collaborating.`,
      })

      router.push(`/dashboard/projects/${project.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error creating project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>Fill in the information below to create your new project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this project is about..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_repo_url">GitHub Repository URL (Optional)</Label>
            <Input
              id="github_repo_url"
              placeholder="https://github.com/username/repository"
              value={formData.github_repo_url}
              onChange={(e) => setFormData({ ...formData, github_repo_url: e.target.value })}
              type="url"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
