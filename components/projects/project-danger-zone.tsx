"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ProjectDangerZoneProps {
  project: any
}

export function ProjectDangerZone({ project }: ProjectDangerZoneProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== project.name) {
      toast({
        title: "Confirmation failed",
        description: "Please type the project name exactly to confirm deletion.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await supabase.from("projects").delete().eq("id", project.id)

      if (error) throw error

      toast({
        title: "Project deleted",
        description: "The project has been permanently deleted.",
      })

      router.push("/dashboard/projects")
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible and destructive actions for this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 p-4 border border-destructive rounded-lg">
          <div>
            <h4 className="font-medium text-destructive">Delete Project</h4>
            <p className="text-sm text-muted-foreground">
              This will permanently delete the project, all tasks, documentation, and associated data. This action
              cannot be undone.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Type "{project.name}" to confirm deletion</Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={project.name}
            />
          </div>

          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || confirmText !== project.name}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Project
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
