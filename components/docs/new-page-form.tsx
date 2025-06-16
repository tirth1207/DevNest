"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "./rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface NewPageFormProps {
  projectId: string
}

export function NewPageForm({ projectId }: NewPageFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_published: false,
  })

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const slug = generateSlug(formData.title)

      const { data: page, error } = await supabase
        .from("pages")
        .insert({
          project_id: projectId,
          title: formData.title,
          content: { type: "markdown", content: formData.content },
          slug,
          author_id: user.id,
          is_published: formData.is_published,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Page created",
        description: "Your documentation page has been created successfully.",
      })

      router.push(`/dashboard/projects/${projectId}/pages/${page.id}`)
    } catch (error) {
      console.error("Error creating page:", error)
      toast({
        title: "Error",
        description: "Failed to create page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <CardDescription>Basic information about your documentation page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Getting Started Guide"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Write your documentation using Markdown</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            initialContent={formData.content}
            onSave={async (content) => {
              setFormData({ ...formData, content })
            }}
            placeholder="Start writing your documentation..."
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Page
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
