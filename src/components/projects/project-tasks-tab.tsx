"use client"

import { useState, useEffect } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { useProjectMembers } from "@/hooks/use-project-members"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Zap,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { Task, TaskWithRelations } from "@/lib/supabase"

interface ProjectTasksTabProps {
  projectId: string
}

export function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const { toast } = useToast()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [])

  const filters = {
    status: statusFilter !== "all" ? (statusFilter as Task["status"]) : undefined,
    priority: priorityFilter !== "all" ? (priorityFilter as Task["priority"]) : undefined,
    search: searchTerm || undefined,
  }

  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } = useTasks(projectId, filters)
  const { members } = useProjectMembers(projectId)

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "open" as Task["status"],
    priority: "medium" as Task["priority"],
    type: "task" as Task["type"],
    assignee_id: "unassigned",
    due_date: "",
    estimated_hours: "",
  })

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "open" as Task["status"],
    priority: "medium" as Task["priority"],
    type: "task" as Task["type"],
    assignee_id: "unassigned",
    due_date: "",
    estimated_hours: "",
  })

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" })
      return
    }

    if (!currentUser) {
      toast({ title: "Login required", variant: "destructive" })
      return
    }

    const payload = {
      project_id: projectId,
      reporter_id: currentUser.id,
      title: newTask.title.trim(),
      description: newTask.description || null,
      status: newTask.status,
      priority: newTask.priority,
      type: newTask.type,
      assignee_id: newTask.assignee_id === "unassigned" ? null : newTask.assignee_id,
      due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
      estimated_hours: newTask.estimated_hours ? Number(newTask.estimated_hours) : null,
    }

    const created = await createTask(payload as any)
    if (created) {
      toast({ title: "Task created successfully" })
      setNewTask({
        title: "",
        description: "",
        status: "open",
        priority: "medium",
        type: "task",
        assignee_id: "unassigned",
        due_date: "",
        estimated_hours: "",
      })
      setIsCreateDialogOpen(false)
    } else {
      toast({ title: "Failed to create task", variant: "destructive" })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const deleted = await deleteTask(taskId)
    toast({
      title: deleted ? "Task deleted" : "Failed to delete task",
      variant: deleted ? "default" : "destructive",
    })
  }

  const handleEditClick = (task: TaskWithRelations) => {
    setEditingTask(task)
    setEditForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      type: task.type,
      assignee_id: task.assignee_id || "unassigned",
      due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
      estimated_hours: task.estimated_hours ? String(task.estimated_hours) : "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTask = async () => {
    if (!editingTask) return
    if (!editForm.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" })
      return
    }

    const updates: any = {
      title: editForm.title.trim(),
      description: editForm.description || null,
      status: editForm.status,
      priority: editForm.priority,
      type: editForm.type,
      assignee_id: editForm.assignee_id === "unassigned" ? null : editForm.assignee_id,
      due_date: editForm.due_date ? new Date(editForm.due_date).toISOString() : null,
      estimated_hours: editForm.estimated_hours ? Number(editForm.estimated_hours) : null,
    }

    const updated = await updateTask(editingTask.id, updates)
    if (updated) {
      toast({ title: "Task updated successfully" })
      setIsEditDialogOpen(false)
      setEditingTask(null)
    } else {
      toast({ title: "Failed to update task", variant: "destructive" })
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "closed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in_progress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "closed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      case "blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getTypeColor = (type: Task["type"]) => {
    switch (type) {
      case "task":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
      case "bug":
        return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800"
      case "feature":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
      case "epic":
        return "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
      default:
        return "bg-slate-50 text-slate-700"
    }
  }

  if (error) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading tasks: {error}
              <Button variant="outline" size="sm" className="ml-4 bg-transparent" onClick={refetch}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Tasks ({tasks.length})
              </CardTitle>
              <CardDescription>Manage and track project tasks</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 ">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Add details..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newTask.type}
                        onValueChange={(value) => setNewTask({ ...newTask, type: value as Task["type"] })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="task">Task</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select
                      value={newTask.assignee_id}
                      onValueChange={(value) => setNewTask({ ...newTask, assignee_id: value })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.profile?.full_name || member.profile?.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Task title"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Add details..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Type</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(value) => setEditForm({ ...editForm, type: value as Task["type"] })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="task">Task</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-priority">Priority</Label>
                      <Select
                        value={editForm.priority}
                        onValueChange={(value) => setEditForm({ ...editForm, priority: value as Task["priority"] })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm({ ...editForm, status: value as Task["status"] })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-assignee">Assignee</Label>
                    <Select
                      value={editForm.assignee_id}
                      onValueChange={(value) => setEditForm({ ...editForm, assignee_id: value })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.profile?.full_name || member.profile?.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-due_date">Due Date</Label>
                    <Input
                      id="edit-due_date"
                      type="date"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTask}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-1">No tasks found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create a new task to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 hover:border-border/80 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusIcon(task.status)}
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors flex-1 truncate">
                          {task.title}
                        </h4>
                        <Badge className={getTypeColor(task.type)} variant="outline">
                          {task.type}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground pt-2">
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.assignee && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={task.assignee.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(task)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-500">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
