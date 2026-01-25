"use client"

import { CardDescription } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { useTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { differenceInDays, addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, AlertTriangle, CheckCircle2, Circle } from "lucide-react"
import type { Task, TaskWithRelations } from "@/lib/supabase"
import { useState, useMemo } from "react"

interface ProjectCalendarTabProps {
    projectId: string
}

export function ProjectCalendarTab({ projectId }: ProjectCalendarTabProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    // We show all tasks for the project to place them on the timeline
    const { tasks, loading } = useTasks(projectId)

    // Timeline range: start of month to end of month
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    /* ───────────────── Semantic Color System ───────────────── */
    const getTaskColor = (taskId: string, type: Task["type"]) => {
        const colors = {
            task: {
                bg: "bg-blue-100/60 dark:bg-blue-950/50",
                border: "border-blue-300/50 dark:border-blue-800/50",
                text: "text-blue-700 dark:text-blue-300",
                dot: "bg-blue-500 dark:bg-blue-400",
                glow: "hover:shadow-blue-500/20",
            },
            bug: {
                bg: "bg-red-100/60 dark:bg-red-950/50",
                border: "border-red-300/50 dark:border-red-800/50",
                text: "text-red-700 dark:text-red-300",
                dot: "bg-red-500 dark:bg-red-400",
                glow: "hover:shadow-red-500/20",
            },
            feature: {
                bg: "bg-emerald-100/60 dark:bg-emerald-950/50",
                border: "border-emerald-300/50 dark:border-emerald-800/50",
                text: "text-emerald-700 dark:text-emerald-300",
                dot: "bg-emerald-500 dark:bg-emerald-400",
                glow: "hover:shadow-emerald-500/20",
            },
            epic: {
                bg: "bg-amber-100/60 dark:bg-amber-950/50",
                border: "border-amber-300/50 dark:border-amber-800/50",
                text: "text-amber-700 dark:text-amber-300",
                dot: "bg-amber-500 dark:bg-amber-400",
                glow: "hover:shadow-amber-500/20",
            },
        }
        return colors[type] || colors.task
    }

    const prevMonth = () => setCurrentDate(addDays(monthStart, -1))
    const nextMonth = () => setCurrentDate(addDays(monthEnd, 1))

    const datedTasks = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return []
        return (tasks as TaskWithRelations[]).filter((t) => t?.due_date)
    }, [tasks])

    if (loading) {
        return (
            <Card className="border border-border/20 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
                <CardContent className="py-24 text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 bg-muted/50 rounded-md mx-auto" />
                        <div className="h-96 w-full bg-muted/40 rounded-md" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <TooltipProvider>
            <Card className="border border-border/20 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm w-full">
                {/* Floating Control Bar */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-6 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="text-base font-semibold text-foreground">Project Timeline</h2>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-muted/40 border border-border/20 rounded-full p-1.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={prevMonth}
                                    className="h-7 w-7 rounded-full hover:bg-muted/60 transition-colors duration-150"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Previous month</TooltipContent>
                        </Tooltip>
                        <div className="text-xs font-semibold min-w-max text-center text-foreground px-3 py-1">
                            {format(currentDate, "MMM")}
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={nextMonth}
                                    className="h-7 w-7 rounded-full hover:bg-muted/60 transition-colors duration-150"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Next month</TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="text-xs text-muted-foreground font-medium">
                        {datedTasks.length} scheduled
                    </div>
                </CardHeader>

                <CardContent className="p-0 border-t border-border/10">
                    <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
                        <div className="min-w-[1200px]">
                            {/* Day Headers */}
                            <div
                                className="grid border-b border-border/10 bg-background/30"
                                style={{ gridTemplateColumns: `260px repeat(${days.length}, 1fr)` }}
                            >
                                <div className="p-4 border-r border-border/10 flex items-center sticky left-0 z-10 bg-background/50 backdrop-blur-sm">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {datedTasks.length} Tasks
                                    </span>
                                </div>
                                {days.map((day) => {
                                    const isCurrentDay = isToday(day)
                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`px-2 w-[45px] text-center border-r border-border/10 flex flex-col items-center justify-center gap-1.5 py-3 transition-colors duration-150 ${
                                                isCurrentDay ? "bg-primary/8" : "hover:bg-muted/20"
                                            }`}
                                        >
                                            <span className="text-[10px] font-medium tracking-wide text-muted-foreground/70 uppercase">
                                                {format(day, "EEE")}
                                            </span>
                                            <span
                                                className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 ${
                                                    isCurrentDay
                                                        ? "bg-primary text-primary-foreground shadow-md"
                                                        : "text-foreground hover:bg-muted/40"
                                                }`}
                                            >
                                                {format(day, "d")}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="relative">
                                {datedTasks.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="inline-flex p-3 bg-muted/30 rounded-lg mb-4">
                                            <CalendarIcon className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">No tasks scheduled</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">
                                            Add due dates to tasks to see them on the timeline
                                        </p>
                                    </div>
                                ) : (
                                    datedTasks.map((task) => {
                                        if (!task?.due_date || !task?.created_at) return null
                                        const dueDate = new Date(task.due_date)
                                        const createdAt = new Date(task.created_at)

                                        const displayStart = createdAt < monthStart ? monthStart : createdAt
                                        const displayEnd = dueDate > monthEnd ? monthEnd : dueDate

                                        if (dueDate < monthStart || createdAt > monthEnd) return null

                                        const startOffset = differenceInDays(displayStart, monthStart)
                                        const duration = Math.max(1, differenceInDays(displayEnd, displayStart) + 1)

                                        const colors = getTaskColor(task.id, task.type)

                                        return (
                                            <div
                                                key={task.id}
                                                className="grid items-center group border-b border-border/10 last:border-0 relative min-h-16 hover:bg-muted/15 transition-colors duration-150"
                                                style={{ gridTemplateColumns: `260px repeat(${days.length}, 1fr)` }}
                                            >
                                                {/* Task Label - Frozen Left Column */}
                                                <div className="p-4 border-r border-border/10 bg-background/50 backdrop-blur-sm sticky left-0 z-20 flex flex-col gap-1.5 overflow-hidden shrink-0 justify-center">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-[9px] uppercase font-semibold h-5 px-2 leading-none border ${colors.border} ${colors.bg} ${colors.text}`}
                                                        >
                                                            {task.type}
                                                        </Badge>
                                                        {task.priority === "critical" && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                                <span className="text-[9px] font-semibold text-red-600 dark:text-red-400">
                                                                    Critical
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-2">
                                                        {task.title}
                                                    </span>
                                                </div>

                                                {/* Day Cells Background */}
                                                {days.map((day, i) => (
                                                    <div
                                                        key={i}
                                                        className={`px-2 w-[45px] border-r border-border/10 h-full pointer-events-none ${
                                                            isToday(day)
                                                                ? "bg-primary/6 border-r border-primary/20"
                                                                : ""
                                                        }`}
                                                        style={{ gridColumn: i + 2, gridRow: 1 }}
                                                    />
                                                ))}

                                                {/* Timeline Bar - Capsule Design */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className={`rounded-md border flex items-center px-3 gap-2 overflow-hidden transition-all duration-200 cursor-pointer z-10 mx-1 self-center shadow-sm hover:shadow-lg hover:-translate-y-1 ${colors.bg} ${colors.border} ${colors.text} ${colors.glow}`}
                                                            style={{
                                                                gridColumn: `${startOffset + 2} / span ${duration}`,
                                                                gridRow: 1,
                                                                marginTop: "6px",
                                                                marginBottom: "6px",
                                                                height: "36px",
                                                                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                {task.assignee && (
                                                                    <Avatar className="h-5 w-5 border-1 border-background shrink-0 ring-1 ring-border/20">
                                                                        <AvatarImage
                                                                            src={
                                                                                task.assignee.avatar_url || ""
                                                                            }
                                                                        />
                                                                        <AvatarFallback
                                                                            className={`text-[9px] font-bold ${colors.bg}`}
                                                                        >
                                                                            {task.assignee.full_name?.charAt(0) ||
                                                                                "?"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                )}
                                                                <span className="text-xs font-medium truncate">
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {task.status === "completed" && (
                                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                )}
                                                                {task.status === "in_progress" && (
                                                                    <Circle className="h-3 w-3 text-blue-600 dark:text-blue-400 fill-current" />
                                                                )}
                                                                {task.status === "todo" && (
                                                                    <Circle className="h-3 w-3 text-muted-foreground/50" />
                                                                )}
                                                                {task.status === "blocked" && (
                                                                    <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="w-full">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="font-semibold text-sm">{task.title}</div>
                                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                                    {task.type.charAt(0).toUpperCase() +
                                                                        task.type.slice(1)}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 border-t border-border/20 pt-2">
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                                    <span>
                                                                        Due{" "}
                                                                        {format(dueDate, "MMM d")}
                                                                    </span>
                                                                </div>
                                                                {task.assignee && (
                                                                    <div className="flex items-center gap-2 text-xs">
                                                                        <Avatar className="h-4 w-4">
                                                                            <AvatarImage
                                                                                src={
                                                                                    task.assignee.avatar_url || ""
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="text-[8px]">
                                                                                {task.assignee.full_name?.charAt(0) ||
                                                                                    "?"}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span>
                                                                            {task.assignee.full_name}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[9px] h-5 px-1.5 py-0"
                                                                    >
                                                                        {task.status.replace(
                                                                            "_",
                                                                            " "
                                                                        )}
                                                                    </Badge>
                                                                    {task.priority === "critical" && (
                                                                        <Badge
                                                                            variant="destructive"
                                                                            className="text-[9px] h-5 px-1.5 py-0"
                                                                        >
                                                                            Critical
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {task.status === "blocked" && (
                                                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mt-1">
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        <span>Blocked</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* Legend Footer */}
                <div className="p-4 bg-muted/20 border-t border-border/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                                <span className="text-xs font-medium text-foreground">Task</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                                <span className="text-xs font-medium text-foreground">Bug</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                                <span className="text-xs font-medium text-foreground">Feature</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                                <span className="text-xs font-medium text-foreground">Epic</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-muted-foreground text-xs font-medium flex items-center gap-2">
                        <span>{format(currentDate, "MMMM yyyy")}</span>
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    )
}
