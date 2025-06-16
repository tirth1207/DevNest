"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { GitBranch, ExternalLink, RefreshCw, Settings, Loader2 } from "lucide-react"

interface GitHubIntegrationProps {
  projectId: string
  currentRepoUrl?: string | null
}

export function GitHubIntegration({ projectId, currentRepoUrl }: GitHubIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [repoUrl, setRepoUrl] = useState(currentRepoUrl || "")
  const [isConnected, setIsConnected] = useState(!!currentRepoUrl)
  const { toast } = useToast()
  const supabase = createClient()

  const handleConnect = async () => {
    if (!repoUrl.trim()) return

    setIsLoading(true)
    try {
      // Validate GitHub URL
      const githubUrlPattern = /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/
      if (!githubUrlPattern.test(repoUrl)) {
        throw new Error("Please enter a valid GitHub repository URL")
      }

      // Extract repo info
      const urlParts = repoUrl.replace("https://github.com/", "").split("/")
      const owner = urlParts[0]
      const repo = urlParts[1]

      // Update project with GitHub info
      const { error } = await supabase
        .from("projects")
        .update({
          github_repo_url: repoUrl,
          github_default_branch: "main", // Default, could be detected
        })
        .eq("id", projectId)

      if (error) throw error

      // Simulate fetching repository data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsConnected(true)
      toast({
        title: "Repository connected",
        description: `Successfully connected to ${owner}/${repo}`,
      })

      // Trigger initial sync
      await handleSync()
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect repository",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      // Simulate syncing commits
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would:
      // 1. Fetch commits from GitHub API
      // 2. Store them in github_commits table
      // 3. Create activity entries
      // 4. Send notifications if needed

      toast({
        title: "Sync completed",
        description: "Repository data has been synchronized",
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync repository data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          github_repo_url: null,
          github_repo_id: null,
          github_default_branch: null,
        })
        .eq("id", projectId)

      if (error) throw error

      setIsConnected(false)
      setRepoUrl("")
      toast({
        title: "Repository disconnected",
        description: "GitHub integration has been disabled",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect repository",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            <CardTitle>GitHub Integration</CardTitle>
          </div>
          {isConnected ? <Badge variant="default">Connected</Badge> : <Badge variant="outline">Not Connected</Badge>}
        </div>
        <CardDescription>
          Connect your GitHub repository to sync commits, issues, and enable automated workflows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleConnect} disabled={isLoading || !repoUrl.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Connect Repository
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{repoUrl.split("/").slice(-2).join("/")}</p>
                <p className="text-sm text-muted-foreground">{repoUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSync} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sync
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure Webhooks
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={isLoading}>
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
