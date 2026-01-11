"use client"

import { useTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { differenceInDays, addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import type { Task, TaskWithRelations } from "@/lib/supabase"
import { useState, useMemo } from "react"

interface ProjectCalendarTabProps {
    projectId: string
}

export function ProjectCalendarTab({ projectId }: ProjectCalendarTabProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    // We show all tasks for the project to place them on the timeline
    const { tasks, loading, error, refetch } = useTasks(projectId)

    // Timeline range: start of month to end of month + some buffer or just current month
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    /* ───────────────── Modern Color System ───────────────── */
    const getTaskColor = (taskId: string, type: Task["type"]) => {
        const hash = taskId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const colors = {
            task: {
                bg: "bg-blue-50 dark:bg-blue-950/40",
                border: "border-blue-200 dark:border-blue-800",
                text: "text-blue-700 dark:text-blue-300",
                dot: "bg-blue-500",
            },
            bug: {
                bg: "bg-red-50 dark:bg-red-950/40",
                border: "border-red-200 dark:border-red-800",
                text: "text-red-700 dark:text-red-300",
                dot: "bg-red-500",
            },
            feature: {
                bg: "bg-emerald-50 dark:bg-emerald-950/40",
                border: "border-emerald-200 dark:border-emerald-800",
                text: "text-emerald-700 dark:text-emerald-300",
                dot: "bg-emerald-500",
            },
            epic: {
                bg: "bg-violet-50 dark:bg-violet-950/40",
                border: "border-violet-200 dark:border-violet-800",
                text: "text-violet-700 dark:text-violet-300",
                dot: "bg-violet-500",
            },
        }
        return colors[type] || colors.task
    }

    const prevMonth = () => setCurrentDate(addDays(monthStart, -1))
    const nextMonth = () => setCurrentDate(addDays(monthEnd, 1))

    const datedTasks = useMemo(() => {
        return (tasks as TaskWithRelations[]).filter((t) => t.due_date)
    }, [tasks])

    if (loading) {
        return (
            <Card className="border-0 shadow-sm overflow-hidden bg-card">
                <CardContent className="py-24 text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 bg-muted rounded-lg mx-auto" />
                        <div className="h-96 w-full bg-muted rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-sm overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8 pt-6 px-8 border-b border-border/40 bg-gradient-to-r from-card to-card/50">
                <div className="space-y-1.5">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        Project Timeline
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Visual schedule and task delivery timeline
                    </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={prevMonth}
                        className="h-9 w-9 border-border/40 hover:bg-muted/50 transition-colors bg-transparent"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-semibold min-w-[140px] text-center text-foreground">
                        {format(currentDate, "MMMM yyyy")}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextMonth}
                        className="h-9 w-9 border-border/40 hover:bg-muted/50 transition-colors bg-transparent"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0 border-t border-border/40">
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="min-w-[1200px]">
                        <div
                            className="grid border-b border-border/40 bg-muted/20"
                            style={{ gridTemplateColumns: `280px repeat(${days.length}, 1fr)` }}
                        >
                            <div className="p-4 font-semibold text-sm border-r border-border/40 flex items-center bg-background sticky left-0 z-10 text-foreground">
                                Tasks ({datedTasks.length})
                            </div>
                            {days.map((day) => (
                                <div
                                    key={day.toISOString()}
                                    className={`px-2 w-[45px] text-center border-r border-border/40 flex flex-col items-center justify-center gap-2 transition-colors ${isToday(day) ? "bg-primary/8 border-r border-primary/30" : "hover:bg-muted/30"
                                        }`}
                                >
                                    <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                                        {format(day, "EEE")}
                                    </span>
                                    <span
                                        className={`text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isToday(day) ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted"
                                            }`}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="relative">
                            {datedTasks.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="inline-flex p-3 bg-muted rounded-lg mb-4">
                                        <CalendarIcon className="h-8 w-8 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No tasks with due dates</p>
                                    <p className="text-sm text-muted-foreground/60">Add due dates to tasks to see them on the timeline</p>
                                </div>
                            ) : (
                                datedTasks.map((task) => {
                                    const dueDate = new Date(task.due_date!)
                                    const createdAt = new Date(task.created_at!)

                                    // Start of task for visualization: handle tasks starting before the current month view
                                    const displayStart = createdAt < monthStart ? monthStart : createdAt
                                    const displayEnd = dueDate > monthEnd ? monthEnd : dueDate

                                    if (dueDate < monthStart || createdAt > monthEnd) return null

                                    const startOffset = differenceInDays(displayStart, monthStart)
                                    const duration = Math.max(1, differenceInDays(displayEnd, displayStart) + 1)

                                    const colors = getTaskColor(task.id, task.type)

                                    return (
                                        <div
                                            key={task.id}
                                            className="grid items-stretch group border-b border-border/30 last:border-0 relative min-h-20 hover:bg-muted/20 transition-colors"
                                            style={{ gridTemplateColumns: `280px repeat(${days.length}, 1fr)` }}
                                        >
                                            <div className="p-4 border-r border-border/40 bg-background sticky left-0 z-20 flex flex-col gap-2 overflow-hidden shrink-0 justify-center">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] uppercase font-bold h-5 px-2 leading-none border ${colors.border} ${colors.bg} ${colors.text}`}
                                                    >
                                                        {task.type}
                                                    </Badge>
                                                    {task.priority === "critical" && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                            <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">Critical</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {task.title}
                                                </span>
                                            </div>

                                            {/* Vertical Background Lines (Individual Cells) */}
                                            {days.map((day, i) => (
                                                <div
                                                    key={i}
                                                    className={`px-2 w-[45px] border-r border-border/20 h-full pointer-events-none ${isToday(day) ? "bg-primary/5 border-r border-primary/20" : ""
                                                        }`}
                                                    style={{ gridColumn: i + 2, gridRow: 1 }}
                                                />
                                            ))}

                                            <div
                                                className={`rounded-lg border-2 flex items-center px-3 gap-2 overflow-hidden transition-all duration-200 cursor-pointer z-10 mx-1 self-center shadow-sm hover:shadow-md hover:-translate-y-0.5 ${colors.bg} ${colors.border} ${colors.text}`}
                                                style={{
                                                    gridColumn: `${startOffset + 2} / span ${duration}`,
                                                    gridRow: 1,
                                                    marginTop: "8px",
                                                    marginBottom: "8px",
                                                    height: "calc(100% - 16px)",
                                                }}
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {task.assignee && (
                                                        <Avatar className="h-6 w-6 border-2 border-background shrink-0 ring-1 ring-border/20">
                                                            <AvatarImage src={task.assignee.avatar_url || ""} />
                                                            <AvatarFallback className={`text-[10px] font-bold ${colors.bg}`}>
                                                                {task.assignee.full_name?.charAt(0) || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className="text-xs font-semibold truncate">{task.title}</span>
                                                </div>
                                                <span className="text-[10px] font-bold opacity-50 uppercase whitespace-nowrap hidden sm:block">
                                                    {task.status.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>

            <div className="p-5 bg-muted/30 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2 font-medium">
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                        <span className="text-foreground">Task</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <span className="text-foreground">Bug</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                        <span className="text-foreground">Feature</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                        <div className="w-3 h-3 rounded-sm bg-violet-500" />
                        <span className="text-foreground">Epic</span>
                    </div>
                </div>
                <div className="text-foreground font-medium">{format(currentDate, "MMMM yyyy")}</div>
            </div>
        </Card>
    )
}
