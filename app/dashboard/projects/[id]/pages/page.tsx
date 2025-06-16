import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, FileText, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface ProjectPagesPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPagesPage({ params }: ProjectPagesPageProps) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      organization:organizations(name)
    `)
    .eq("id", params.id)
    .single()

  if (!project) {
    notFound()
  }

  // Get all pages for this project
  const { data: pages } = await supabase
    .from("pages")
    .select(`
      *,
      author:profiles!pages_author_id_fkey(full_name, avatar_url),
      last_editor:profiles!pages_last_edited_by_fkey(full_name)
    `)
    .eq("project_id", params.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">Project documentation and wiki for {project.name}</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${params.id}/pages/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search documentation..." className="pl-10" />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      {pages && pages.length > 0 ? (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/projects/${params.id}/pages/${page.id}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {page.title}
                        </Link>
                        {page.is_published ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={page.author.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {page.author.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span>Created by {page.author.full_name}</span>
                        </div>

                        <span>•</span>
                        <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>

                        {page.last_editor && page.last_editor.full_name !== page.author.full_name && (
                          <>
                            <span>•</span>
                            <span>Last edited by {page.last_editor.full_name}</span>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${params.id}/pages/${page.id}/edit`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${params.id}/pages/${page.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documentation yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first documentation page to start building your project wiki.
            </p>
            <Button asChild>
              <Link href={`/dashboard/projects/${params.id}/pages/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first page
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
