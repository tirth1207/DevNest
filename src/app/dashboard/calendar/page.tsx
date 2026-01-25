"use client"

import { useState, useMemo } from "react"
import { useUserTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Tag,
  Filter
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  addWeeks,
  subWeeks,
  startOfDay,
  getDay
} from "date-fns"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { TaskWithRelations } from "@/lib/supabase"

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  const { tasks: allTasks, loading } = useUserTasks()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)

  // Filter tasks based on URL parameter and local filters
  const filteredTasks = allTasks?.filter((task: TaskWithRelations) => {
    if (filter === 'assigned' && !task.assignee) return false
    if (filter === 'overdue' && (!task.due_date || new Date(task.due_date) >= new Date())) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    return true
  }) || []

  // Get tasks grouped by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, TaskWithRelations[]> = {}
    filteredTasks.forEach(task => {
      if (task.due_date) {
        const dateKey = startOfDay(new Date(task.due_date)).toISOString()
        if (!grouped[dateKey]) grouped[dateKey] = []
        grouped[dateKey].push(task)
      }
    })
    return grouped
  }, [filteredTasks])

  const getTaskColor = (task: TaskWithRelations) => {
    const colors = {
      task: "bg-blue-500",
      bug: "bg-red-500",
      feature: "bg-emerald-500",
      epic: "bg-amber-500"
    }
    return colors[task.type as keyof typeof colors] || colors.task
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-3 w-3" />
      case "in_progress": return <Circle className="h-3 w-3 fill-current" />
      case "open": return <Circle className="h-3 w-3" />
      case "blocked": return <AlertTriangle className="h-3 w-3" />
      default: return <Circle className="h-3 w-3" />
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    }
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map(day => {
          const dateKey = startOfDay(day).toISOString()
          const dayTasks = tasksByDate[dateKey] || []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={`bg-background min-h-[120px] p-2 ${
                !isCurrentMonth ? 'bg-muted/30' : ''
              } ${isTodayDate ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <div className={`text-sm font-medium mb-2 ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <TooltipProvider key={task.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className={`w-full text-left text-xs p-1 rounded text-white truncate ${getTaskColor(task)} hover:opacity-80 transition-opacity`}
                        >
                          {task.title}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="space-y-4">
        {days.map(day => {
          const dateKey = startOfDay(day).toISOString()
          const dayTasks = tasksByDate[dateKey] || []
          const isTodayDate = isToday(day)

          return (
            <Card key={day.toISOString()} className={`border-border/50 ${isTodayDate ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(day, 'EEEE, MMM d')}
                  {isTodayDate && <Badge variant="secondary">Today</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayTasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tasks scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getTaskColor(task)} text-white`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs opacity-90 mt-1">{task.project?.name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto py-8">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
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
                Calendar
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage your tasks in calendar format
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/projects">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          </div>

          {/* Controls */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold min-w-max">
                    {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                    {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
                  </h2>
                  <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* View Mode */}
                <div className="flex gap-2">
                  {(['month', 'week'] as ViewMode[]).map(mode => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode(mode)}
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex flex-1 gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
            </CardContent>
          </Card>

          {/* Task Details Dialog */}
          <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Task Details</DialogTitle>
              </DialogHeader>
              {selectedTask && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTaskColor(selectedTask)}`}>
                      {getStatusIcon(selectedTask.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedTask.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTask.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge variant="secondary" className="ml-2">
                        {selectedTask.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedTask.priority || 'medium'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2 capitalize">{selectedTask.type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Due:</span>
                      <span className="ml-2">
                        {selectedTask.due_date ? format(new Date(selectedTask.due_date), 'MMM d, yyyy') : 'No due date'}
                      </span>
                    </div>
                  </div>

                  {selectedTask.project && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{selectedTask.project.name}</span>
                    </div>
                  )}

                  {selectedTask.assignee && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedTask.assignee.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {selectedTask.assignee.full_name?.charAt(0) || selectedTask.assignee.email?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedTask.assignee.full_name || selectedTask.assignee.email}</span>
                    </div>
                  )}

                  <Button asChild className="w-full">
                    <Link href={`/dashboard/projects/${selectedTask.project_id}`}>
                      View Project
                    </Link>
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
