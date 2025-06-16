import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitBranch, ExternalLink, Settings, RefreshCw, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectGitHubPageProps {
  params: {
    id: string
  }
}

export default async function ProjectGitHubPage({ params }: ProjectGitHubPageProps) {
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
          <h1 className="text-3xl font-bold tracking-tight">GitHub Integration</h1>
          <p className="text-muted-foreground">Manage GitHub settings and sync for {project.name}</p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Now
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  <CardTitle>Repository Connection</CardTitle>
                </div>
                {project.github_repo_url ? (
                  <Badge variant="default">Connected</Badge>
                ) : (
                  <Badge variant="destructive">Not Connected</Badge>
                )}
              </div>
              <CardDescription>GitHub repository integration status</CardDescription>
            </CardHeader>
            <CardContent>
              {project.github_repo_url ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{project.github_repo_url.split("/").slice(-2).join("/")}</p>
                      <p className="text-sm text-muted-foreground">{project.github_repo_url}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Default branch: {project.github_default_branch || "main"}
                      </p>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{commits?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Recent Commits</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Open Issues</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Pull Requests</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Repository Connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect a GitHub repository to enable commit tracking, issue sync, and automated workflows.
                  </p>
                  <Button>Connect Repository</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Commits */}
          {commits && commits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Commits</CardTitle>
                <CardDescription>Latest commits from the connected repository</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure how GitHub integrates with your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-sync commits</p>
                    <p className="text-sm text-muted-foreground">Automatically sync new commits to the project</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Link GitHub issues to tasks</p>
                    <p className="text-sm text-muted-foreground">Create tasks from GitHub issues automatically</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">PR notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified about pull request activities</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Set up webhooks for real-time GitHub events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Webhook configuration coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
