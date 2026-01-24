"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  
  // Remove /dashboard prefix and split into segments
  const segments = pathname.replace(/^\/dashboard/, "").split("/").filter(Boolean)
  
  // Build breadcrumb items
  const breadcrumbItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      isPage: segments.length === 0,
    },
    ...segments.map((segment, index) => {
      const href = `/dashboard/${segments.slice(0, index + 1).join("/")}`
      const isPage = index === segments.length - 1
      // Format segment name (replace hyphens with spaces, capitalize)
      const title = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      
      return {
        title,
        href,
        isPage,
      }
    }),
  ]

  if (breadcrumbItems.length === 1 && breadcrumbItems[0].isPage) {
    return null // Don't show breadcrumb if we're on the dashboard home
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator className="mx-2" />}
            <BreadcrumbItem>
              {item.isPage ? (
                <BreadcrumbPage className="flex items-center gap-1.5">
                  {index === 0 && <Home className="h-3.5 w-3.5" />}
                  {item.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} className="flex items-center gap-1.5">
                  {index === 0 && <Home className="h-3.5 w-3.5" />}
                  {item.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

