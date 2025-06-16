import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitBranch, ExternalLink, Plus, Settings } from "lucide-react"

interface ProjectReposPageProps {
  params: {
    id: string
  }
}

export default async function ProjectReposPage({ params }: ProjectReposPageProps) {
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

  // Get recent commits
  const { data: commits } = await supabase
    .from("github_commits")
    .select("*")
    .eq("project_id", params.id)
    .order("committed_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">Manage GitHub repositories and integrations for {project.name}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Connect Repository
        </Button>
      </div>

      {/* Connected Repository */}
      {project.github_repo_url ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                <CardTitle>Connected Repository</CardTitle>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
            <CardDescription>Primary repository for this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{project.github_repo_url.split("/").slice(-2).join("/")}</p>
                <p className="text-sm text-muted-foreground">{project.github_repo_url}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Repository Connected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect a GitHub repository to sync commits, issues, and enable advanced integrations.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Repository
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Commits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commits</CardTitle>
          <CardDescription>Latest commits from connected repositories</CardDescription>
        </CardHeader>
        <CardContent>
          {commits && commits.length > 0 ? (
            <div className="space-y-4">
              {commits.map((commit) => (
                <div key={commit.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">{commit.message}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{commit.author_name}</span>
                      <span>{new Date(commit.committed_at).toLocaleDateString()}</span>
                      <span className="font-mono text-xs">{commit.sha.substring(0, 7)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-green-600">+{commit.additions}</span>
                    <span className="mx-1">/</span>
                    <span className="text-red-600">-{commit.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No commits found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Commits will appear here once you connect a repository
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
