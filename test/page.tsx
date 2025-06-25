"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Users, CheckCircle, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { useOrganizations } from "@/hooks/use-organizations"
import { useProjects } from "@/hooks/use-projects"
import { useUserTasks } from "@/hooks/use-tasks"
import { Skeleton } from "@/components/ui/skeleton"

export default function Page() {
  // Commented out hooks for demo
  // const { organizations, loading: orgsLoading } = useOrganizations()
  // const { projects, loading: projectsLoading } = useProjects()
  // const { tasks, loading: tasksLoading } = useUserTasks()

  // Hardcoded stats for demo/recording
  const activeProjects = 3
  const teamMembers = 7
  const completedTasks = 12
  const pendingTasks = 5

  // Hardcoded projects and tasks for demo
  const projects = [
    {
      id: "1",
      name: "DevFlow Demo Project",
      description: "A sample project to showcase DevFlow features",
      status: "active",
    },
    {
      id: "2",
      name: "Mobile App Redesign",
      description: "Complete redesign of the mobile application",
      status: "active",
    },
    {
      id: "3",
      name: "Website Launch",
      description: "Prepare and launch the new company website",
      status: "active",
    },
  ]

  const tasks = [
    {
      id: "1",
      title: "Setup project structure",
      status: "closed",
      priority: "high",
      project: { name: "DevFlow Demo Project" },
    },
    {
      id: "2",
      title: "Design user interface",
      status: "in_progress",
      priority: "medium",
      project: { name: "Mobile App Redesign" },
    },
    {
      id: "3",
      title: "Write documentation",
      status: "open",
      priority: "critical",
      project: { name: "Website Launch" },
    },
  ]

  // Custom card animation class
  const cardClass =
    "transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-2xl"

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* {projectsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{activeProjects}</div>} */}
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">Projects in progress</p>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* {tasksLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{completedTasks}</div>} */}
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks you've completed</p>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* {tasksLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{pendingTasks}</div>} */}
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks assigned to you</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className={`col-span-4 ${cardClass}`}>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.map((project) => (
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

        <Card className={`col-span-3 ${cardClass}`}>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest task updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
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
  )
} 