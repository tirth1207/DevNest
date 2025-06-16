import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Flag, Tag, Edit, MessageSquare } from "lucide-react"
import Link from "next/link"

interface TaskDetailPageProps {
  params: {
    id: string
    taskId: string
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const supabase = await createClient()

  const { data: task } = await supabase
    .from("tasks")
    .select(`
      *,
      project:projects(name),
      assignee:profiles!tasks_assignee_id_fkey(full_name, avatar_url, email),
      reporter:profiles!tasks_reporter_id_fkey(full_name, avatar_url)
    `)
    .eq("id", params.taskId)
    .single()

  if (!task) {
    notFound()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "default"
      case "in_progress":
        return "secondary"
      case "review":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <p className="text-muted-foreground">
            {task.project.name} • Created {new Date(task.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${params.id}/tasks/${params.taskId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <div className="prose prose-sm max-w-none">
                  <p>{task.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comments</CardTitle>
                <Button size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment on this task</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priority</span>
                <Badge variant={getPriorityColor(task.priority)}>
                  <Flag className="mr-1 h-3 w-3" />
                  {task.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Assignee</span>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{task.assignee.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{task.assignee.full_name}</p>
                      <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Reporter</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.reporter.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{task.reporter.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{task.reporter.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dates & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.due_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Due Date</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>
              )}

              {task.estimated_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated</span>
                  <span className="text-sm">{task.estimated_hours}h</span>
                </div>
              )}

              {task.actual_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Actual</span>
                  <span className="text-sm">{task.actual_hours}h</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* GitHub Integration */}
          {task.github_issue_number && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">GitHub</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Issue</span>
                  <Badge variant="outline">#{task.github_issue_number}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
