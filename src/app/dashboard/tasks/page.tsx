"use client"

import { useState, useEffect } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { useUserTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus, Calendar, Clock, AlertTriangle, CheckCircle2, Circle, User, Tag } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { TaskWithRelations } from "@/lib/supabase"

export default function TasksPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  const { tasks: allTasks, loading, error, refetch } = useUserTasks()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Filter tasks based on URL parameter and local filters
  const filteredTasks = allTasks?.filter((task: TaskWithRelations) => {
    // URL filter
    if (filter === 'assigned' && !task.assignee) return false
    if (filter === 'overdue' && (!task.due_date || new Date(task.due_date) >= new Date())) return false

    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false

    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) return false

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false

    return true
  }) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case "in_progress":
        return <Circle className="h-4 w-4 text-blue-600 fill-current" />
      case "open":
        return <Circle className="h-4 w-4 text-muted-foreground" />
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "open":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
      case "blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      case "high":
        return "border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
      case "medium":
        return "border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "low":
        return "border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700"
      default:
        return "border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto py-8">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {filter === 'assigned' ? 'Assigned Tasks' :
                 filter === 'overdue' ? 'Overdue Tasks' :
                 'All Tasks'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {filter === 'assigned' ? 'Tasks assigned to you' :
                 filter === 'overdue' ? 'Tasks that are past their due date' :
                 'Manage and track all your tasks'}
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/projects">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full">
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="pt-16 pb-16 text-center">
                    <div className="inline-flex p-3 bg-muted rounded-lg mb-4">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">No tasks found</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      {filter === 'assigned' ? 'No tasks are assigned to you' :
                       filter === 'overdue' ? 'No overdue tasks' :
                       'Create your first task to get started'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredTasks.map((task: TaskWithRelations) => (
                <Card key={task.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <Badge
                          variant="secondary"
                          className={`text-[10px] uppercase font-bold h-5 px-2 leading-none ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 px-2 leading-none ${getPriorityColor(task.priority || 'medium')}`}
                      >
                        {task.priority || 'medium'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {task.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{task.type}</span>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(task.due_date), "MMM d")}</span>
                        </div>
                      )}
                    </div>

                    {task.assignee && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {task.assignee.full_name?.charAt(0) || task.assignee.email?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {task.assignee.full_name || task.assignee.email}
                        </span>
                      </div>
                    )}

                    {task.project && (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground truncate">
                          {task.project.name}
                        </span>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/dashboard/projects/${task.project_id}`}>
                        View Project
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
