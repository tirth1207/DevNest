"use client"

import type React from "react"
import { useState } from "react"
import { useProjectMembers } from "@/hooks/use-project-members"
import { ProjectsService } from "@/lib/database/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Plus, MoreHorizontal, Mail, UserCheck, Shield } from "lucide-react"
import type { ProjectMember } from "@/lib/supabase"

interface ProjectMembersTabProps {
  projectId: string
  userRole: string
  organizationId: string
  projectOwnerId: string
  currentUserId: string | null
}

export function ProjectMembersTab({
  projectId,
  userRole,
  organizationId,
  projectOwnerId,
  currentUserId,
}: ProjectMembersTabProps) {
  const { members, loading, refetch } = useProjectMembers(projectId)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "read" as ProjectMember["role"],
  })

  const canManageMembers = userRole === "owner" || userRole === "admin" || projectOwnerId === currentUserId

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteData.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    setIsInviting(true)
    try {
      toast({
        title: "Not implemented",
        description: "Project invitations are not implemented yet.",
        variant: "destructive",
      })
      setIsInviteDialogOpen(false)
      setInviteData({ email: "", role: "read" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: ProjectMember["role"]) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    const success = await ProjectsService.updateMemberRole(projectId, member.user_id, newRole)
    if (success) {
      toast({
        title: "Success",
        description: "Member role updated successfully",
      })
      refetch()
    } else {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "write":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      case "read":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage who has access to this project</CardDescription>
            </div>
            {canManageMembers && (
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleInviteMember}>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>Send an invitation to join this project</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteData.email}
                          onChange={(e) => setInviteData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={inviteData.role}
                          onValueChange={(value: ProjectMember["role"]) =>
                            setInviteData((prev) => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">Read - View only</SelectItem>
                            <SelectItem value="write">Write - Can edit</SelectItem>
                            <SelectItem value="admin">Admin - Full access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isInviting}>
                        <Mail className="mr-2 h-4 w-4" />
                        {isInviting ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={member.profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profile.full_name?.charAt(0) || member.profile.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{member.profile.full_name || member.profile.email}</p>
                    {member.profile.github_username && (
                      <p className="text-xs text-muted-foreground">@{member.profile.github_username}</p>
                    )}
                    {!member.profile.github_username && (
                      <p className="text-xs text-muted-foreground">{member.profile.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getRoleColor(member.role)} text-xs`}>
                    {getRoleIcon(member.role)}
                    <span className="ml-1">{member.role}</span>
                  </Badge>
                  {canManageMembers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "read")}>
                          Make Read
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "write")}>
                          Make Write
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "admin")}>
                          Make Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
