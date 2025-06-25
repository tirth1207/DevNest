"use client"

import { useOrganizations } from "@/hooks/use-organizations"
import { useProjects } from "@/hooks/use-projects"
import { useUserTasks } from "@/hooks/use-tasks"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset } from "@/components/ui/sidebar"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Activity,
  CreditCard,
  Users,
  GitBranch,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  const {
    organizations,
    loading: orgsLoading,
  } = useOrganizations()
  const {
    projects,
    loading: projectsLoading,
  } = useProjects()
  const {
    tasks,
    loading: tasksLoading,
  } = useUserTasks()

  // Calculate stats
  const activeProjects = projects?.filter((p) => p.status === "active").length || 0
  // Team members: count unique user IDs across all projects (mocked as 1 for now)
  const teamMembers = 1
  const completedTasks = tasks?.filter((t) => t.status === "closed").length || 0
  const pendingTasks = tasks?.filter((t) => t.status === "open" || t.status === "in_progress").length || 0

  return (
    <SidebarInset>
      <div className="flex-1 min-h-screen bg-gradient-to-br from-white to-blue-50 space-y-6 p-4 pt-10 md:p-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {"Welcome back! Here's what's happening with your projects."}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {projectsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{activeProjects}</div>}
              <p className="text-xs text-muted-foreground">Projects in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers}</div>
              <p className="text-xs text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {tasksLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{completedTasks}</div>}
              <p className="text-xs text-muted-foreground">Tasks you've completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {tasksLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{pendingTasks}</div>}
              <p className="text-xs text-muted-foreground">Tasks assigned to you</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your most recently updated projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : projects && projects.length > 0 ? (
                  projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-sm font-medium leading-none hover:underline"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No projects yet</p>
                    <Button asChild className="mt-2">
                      <Link href="/dashboard/projects/new">Create your first project</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest task updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : tasks && tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-start space-x-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.project?.name} • {task.status?.replace("_", " ")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          task.priority === "critical"
                            ? "destructive"
                            : task.priority === "high"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tasks yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
