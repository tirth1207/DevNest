import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, Settings, Building } from "lucide-react"

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's organizations
  const { data: organizations } = await supabase
    .from("organization_members")
    .select(`
      *,
      organization:organizations(
        *,
        owner:profiles!organizations_owner_id_fkey(full_name, avatar_url)
      )
    `)
    .eq("user_id", user?.id)
    .order("joined_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage your workspaces and team organizations.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Organizations Grid */}
      {organizations && organizations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((orgMember) => {
            const org = orgMember.organization
            return (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={org.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          <Building className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">@{org.slug}</p>
                      </div>
                    </div>
                    <Badge variant={orgMember.role === "owner" ? "default" : "secondary"}>{orgMember.role}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {org.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Team</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Owner: {org.owner.full_name || "Unknown"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Projects
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create an organization to collaborate with your team and manage multiple projects.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create your first organization
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
