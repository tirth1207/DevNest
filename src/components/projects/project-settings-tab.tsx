"use client"

import { useState } from "react"
import { ProjectsService } from "@/lib/database/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Trash2, AlertTriangle, Copy, Check, Link as LinkIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Project, ProjectMember } from "@/lib/supabase"

interface ProjectSettingsTabProps {
  project: Project
  userRole: string
  members: ProjectMember[]
  currentUserId: string | null
}

export function ProjectSettingsTab({ project, userRole, members, currentUserId }: ProjectSettingsTabProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [copied, setCopied] = useState(false)

  const userMember = members.find((member) => member.user_id === currentUserId)
  const isOwner = currentUserId && project.owner_id === currentUserId
  const isAdmin = userMember && userMember.role === "admin"
  const canEdit = !!(isOwner || isAdmin)
  const canInvite = canEdit
  const canDelete = isOwner

  const handleDeleteProject = async () => {
    if (deleteConfirmation !== project.name) {
      toast({
        title: "Error",
        description: "Please type the project name exactly to confirm deletion",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const success = await ProjectsService.deleteProject(project.id)
      if (success) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        })
        router.push("/projects")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/invite/project/${project.id}`
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "Project invite link copied to clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Basic information about this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Project ID</Label>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{project.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-sm">{project.created_at ? new Date(project.created_at).toLocaleString() : "N/A"}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p className="text-sm">{project.updated_at ? new Date(project.updated_at).toLocaleString() : "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <p className="text-sm capitalize">{project.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="mr-2 h-5 w-5" />
              Project Invite Link
            </CardTitle>
            <CardDescription>Share this link to invite people to your project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  <span className="font-medium">Project Invite Link</span>
                </div>
                <p className="text-sm text-muted-foreground">Share this link to invite people to your project</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {typeof window !== "undefined" ? window.location.origin : ""}/invite/project/{project.id}
                </code>
              </div>
              <Button onClick={copyInviteLink} variant="outline" size="sm">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canDelete && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Delete Project</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a project, there is no going back. Please be certain. This will permanently delete the
                  project, all its tasks, and remove all team member associations.
                </p>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Project</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the
                        <strong className="font-medium"> {project.name} </strong>
                        project and all of its data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-red-800 mb-1">This will permanently delete:</p>
                            <ul className="text-red-700 space-y-1">
                              <li>• All project tasks and data</li>
                              <li>• All team member associations</li>
                              <li>• All project invitations</li>
                              <li>• Project history and activity</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirmation">
                          Type <strong>{project.name}</strong> to confirm:
                        </Label>
                        <Input
                          id="delete-confirmation"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder={project.name}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDeleteDialogOpen(false)
                          setDeleteConfirmation("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteProject}
                        disabled={isDeleting || deleteConfirmation !== project.name}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? "Deleting..." : "Delete Project"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
