"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Building2,
  FolderOpen,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebarData } from "@/hooks/use-sidebar-data"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, organizations, projects, currentOrg, loading, error, switchOrganization } = useSidebarData()

  // Transform projects data for NavProjects
  const projectsData = React.useMemo(() => {
    // Filter projects by current organization if one is selected
    const filteredProjects = currentOrg
      ? projects.filter((project) => project.organization_id === currentOrg.id)
      : projects

    return filteredProjects.map((project) => ({
      name: project.name,
      url: `/dashboard/projects/${project.id}`,
      icon: FolderOpen,
    }))
  }, [projects, currentOrg])

  // Navigation items
  const navMain = React.useMemo(() => {
    return [
      {
        title: "Platform",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Organizations",
            url: "/dashboard/organizations",
          },
          {
            title: "Projects",
            url: "/dashboard/projects",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
    ]
  }, [])

  const navSecondary = [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ]

  // Transform user data for NavUser
  const userData = React.useMemo(() => {
    return {
      name: user?.full_name || user?.github_username || "User",
      email: user?.email || "",
      avatar: user?.avatar_url || "/avatars/shadcn.jpg",
    }
  }, [user])

  if (loading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex h-12 items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </SidebarHeader>
        <SidebarContent />
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">DevNest</span>
                  <span className="truncate text-xs text-muted-foreground">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projectsData} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
