import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { GitCommit, FileText, CheckSquare, Users, Settings } from "lucide-react"

interface ProjectActivityPageProps {
  params: {
    id: string
  }
}

export default async function ProjectActivityPage({ params }: ProjectActivityPageProps) {
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

  // Get project activities
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      *,
      actor:profiles!activities_actor_id_fkey(full_name, avatar_url)
    `)
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_created":
      case "task_updated":
      case "task_assigned":
        return CheckSquare
      case "page_created":
      case "page_updated":
        return FileText
      case "member_added":
      case "member_removed":
        return Users
      case "commits_synced":
        return GitCommit
      default:
        return Settings
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_created":
        return "text-green-600"
      case "task_updated":
        return "text-blue-600"
      case "task_assigned":
        return "text-purple-600"
      case "page_created":
        return "text-indigo-600"
      case "member_added":
        return "text-emerald-600"
      case "commits_synced":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const formatActivityMessage = (activity: any) => {
    const actorName = activity.actor?.full_name || "Someone"

    switch (activity.activity_type) {
      case "task_created":
        return `${actorName} created task "${activity.metadata?.task_title}"`
      case "task_updated":
        return `${actorName} updated task "${activity.metadata?.task_title}"`
      case "task_assigned":
        return `${actorName} assigned task "${activity.metadata?.task_title}"`
      case "page_created":
        return `${actorName} created page "${activity.metadata?.page_title}"`
      case "page_updated":
        return `${actorName} updated page "${activity.metadata?.page_title}"`
      case "member_added":
        return `${actorName} added a team member`
      case "member_removed":
        return `${actorName} removed a team member`
      case "commits_synced":
        return `${actorName} synced commits from GitHub`
      case "project_created":
        return `${actorName} created the project`
      case "project_updated":
        return `${actorName} updated project settings`
      default:
        return `${actorName} performed an action`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">Recent activity and changes in {project.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>All activities and changes in chronological order</CardDescription>
        </CardHeader>
        <CardContent>
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.activity_type)
                return (
                  <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                    <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.activity_type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {activity.actor && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.actor.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {activity.actor.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <p className="text-sm font-medium">{formatActivityMessage(activity)}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(activity.created_at).toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.activity_type.replace("_", " ")}
                        </Badge>
                      </div>

                      {activity.metadata && Object.keys(activity.metadata).length > 1 && (
                        <div className="text-xs text-muted-foreground">
                          {activity.metadata.task_priority && <span>Priority: {activity.metadata.task_priority}</span>}
                          {activity.metadata.task_status && <span> • Status: {activity.metadata.task_status}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Activity will appear here as team members work on the project
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
