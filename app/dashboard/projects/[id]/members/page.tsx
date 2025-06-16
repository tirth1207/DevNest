import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Mail, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectMembersPageProps {
  params: {
    id: string
  }
}

export default async function ProjectMembersPage({ params }: ProjectMembersPageProps) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      organization:organizations(name)
    `)
    .eq("id", params.id)
    .single()

  if (!project) {
    notFound()
  }

  // Get project members
  const { data: members } = await supabase
    .from("project_members")
    .select(`
      *,
      user:profiles(full_name, email, avatar_url, github_username)
    `)
    .eq("project_id", params.id)
    .order("added_at", { ascending: false })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "write":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Manage team members and permissions for {project.name}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Project Members ({members?.length || 0})</CardTitle>
          <CardDescription>People who have access to this project</CardDescription>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {member.user.full_name?.charAt(0) || member.user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.user.full_name || member.user.email}</p>
                        <Badge variant={getRoleColor(member.role)}>{member.role}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{member.user.email}</span>
                        {member.user.github_username && <span>@{member.user.github_username}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(member.added_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Message
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No team members yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Invite team members to start collaborating on this project
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Invite First Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Invitations that haven't been accepted yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending invitations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
