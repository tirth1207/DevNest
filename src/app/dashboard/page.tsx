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
} from "lucide-react"

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

  return (
    <SidebarInset>
      <div className="flex-1 min-h-screen bg-gradient-to-br from-white to-blue-50 space-y-6 p-4 pt-10 md:p-12">
        <div className="mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-2">
            Hi, Welcome Back <span className="inline-block animate-wave">👋</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Here's a quick overview of your organizations, projects, and tasks. Stay productive and keep building amazing things!
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Organizations
              </CardTitle>
              <Users className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              {orgsLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-primary">{organizations.length}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-primary">{projects.length}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tasks
              </CardTitle>
              <Activity className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-3xl font-bold text-primary">{tasks.length}</div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                You have {projects.length} projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.slice(0, 5).map((project) => (
                      <TableRow key={project.id} className="hover:bg-primary/10 transition-colors">
                        <TableCell>
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="font-medium hover:text-primary hover:underline text-primary"
                          >
                            {project.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge>{project.status || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/organizations/${project.organization?.slug}`} className="hover:text-primary hover:underline">
                            {project.organization?.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {"due_date" in project && project.due_date
                            ? new Date((project as any).due_date).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-3 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                You have {tasks.length} active tasks assigned to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between hover:bg-primary/10 rounded-lg px-2 py-2 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage
                            src={task.assignee?.avatar_url || ""}
                            alt="Avatar"
                          />
                          <AvatarFallback>
                            {task.assignee?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            <Link
                              href={`/dashboard/projects/${task.project.id}/tasks/${task.number}`}
                              className="hover:text-primary hover:underline text-primary"
                            >
                              {task.title}
                            </Link>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {task.project.name}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
