"use client"

import * as React from "react"
import { Building2, FolderOpen, Home, GitBranch, CheckSquare, Users, Settings, AlertCircle } from 'lucide-react'

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebarData } from "@/hooks/use-sidebar-data"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { user, organizations, projects, currentOrg, loading, error, switchOrganization } = useSidebarData()

  // Transform organizations data for TeamSwitcher
  const teams = React.useMemo(() => {
    return organizations.map((org) => ({
      name: org.name,
      logo: Building2,
      plan: "Free", // You can add plan information to your org schema later
      id: org.id,
      slug: org.slug,
    }))
  }, [organizations])

  // Transform projects data for NavProjects
  const projectsData = React.useMemo(() => {
    // Filter projects by current organization if one is selected
    const filteredProjects = currentOrg
      ? projects.filter((project) => project.organization_id === currentOrg.id)
      : projects

    return filteredProjects.slice(0, 5).map((project) => ({
      name: project.name,
      url: `/dashboard/projects/${project.id}`,
      icon: FolderOpen,
      id: project.id,
      slug: project.slug,
    }))
  }, [projects, currentOrg])

  // Navigation items
  const navMain = React.useMemo(() => {
    return [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isActive: true,
      },
      {
        title: "Organizations",
        url: "/dashboard/organizations",
        icon: Building2,
        items: [
          {
            title: "All Organizations",
            url: "/dashboard/organizations",
          },
        ],
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: GitBranch,
        items: [
          {
            title: "All Projects",
            url: "/dashboard/projects",
          },
        ],
      },
    ]
  }, [currentOrg])

  // Transform user data for NavUser
  const userData = React.useMemo(() => {
    if (!user) {
      return {
        name: "Loading...",
        email: "",
        avatar: "/placeholder.svg?height=32&width=32",
      }
    }

    return {
      name: user.full_name || user.github_username || "User",
      email: user.email || "",
      avatar: user.avatar_url || "/placeholder.svg?height=32&width=32",
    }
  }, [user])

  if (loading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex h-12 items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }

  if (error) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="p-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load sidebar data</AlertDescription>
            </Alert>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-center text-sm text-red-500">{error}</div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} onTeamChange={switchOrganization} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projectsData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
