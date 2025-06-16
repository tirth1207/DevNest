import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectTasksPageProps {
  params: {
    id: string
  }
}

export default async function ProjectTasksPage({ params }: ProjectTasksPageProps) {
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

  // Get all tasks for this project
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(full_name, avatar_url),
      reporter:profiles!tasks_reporter_id_fkey(full_name)
    `)
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks?.filter((t) => t.status === "todo") || [],
    in_progress: tasks?.filter((t) => t.status === "in_progress") || [],
    review: tasks?.filter((t) => t.status === "review") || [],
    done: tasks?.filter((t) => t.status === "done") || [],
    cancelled: tasks?.filter((t) => t.status === "cancelled") || [],
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage tasks for {project.name}</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${params.id}/tasks/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Switch to the dedicated Kanban view for the best task management experience
            </p>
            <Button asChild>
              <Link href={`/dashboard/projects/${params.id}/kanban`}>Open Kanban Board</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search tasks..." className="pl-10" />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                      {status.replace("_", " ")} ({statusTasks.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusTasks.map((task) => (
                    <Card key={task.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <Link href={`/dashboard/projects/${params.id}/tasks/${task.id}`}>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                            <div
                              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 mt-1`}
                            />
                          </div>

                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Badge variant={getStatusColor(task.status)} className="text-xs">
                                {task.priority}
                              </Badge>
                              {task.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {task.assignee && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={task.assignee.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {task.assignee.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {task.due_date && <span>Due {new Date(task.due_date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}

                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
