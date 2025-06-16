import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthButton } from "@/components/auth/auth-button"
import { GitBranch, Users, FileText, Activity, CheckCircle, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GitBranch className="size-4" />
            </div>
            <span className="text-xl font-bold">DevFlow</span>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            The All-in-One Platform for <span className="text-primary">Developer Teams</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Combine project management, documentation, GitHub integration, and team collaboration in one powerful
            platform. Built for developers, by developers.
          </p>
          <div className="flex gap-4 justify-center">
            <AuthButton />
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Ship Faster</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            DevFlow combines the best of project management, documentation, and collaboration tools into one seamless
            experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <GitBranch className="h-8 w-8 text-primary mb-2" />
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Connect your repositories, sync commits, and track code changes automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic commit syncing</li>
                <li>• Link tasks to GitHub issues</li>
                <li>• Real-time repository insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Organize work with powerful task management and team collaboration features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Kanban boards and lists</li>
                <li>• Task assignments and priorities</li>
                <li>• Progress tracking and reporting</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Create and maintain project documentation with a Notion-like editor.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Rich text editing</li>
                <li>• Collaborative editing</li>
                <li>• Version history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>Invite team members, assign roles, and collaborate in real-time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Role-based permissions</li>
                <li>• Real-time comments</li>
                <li>• Team activity feeds</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Activity Tracking</CardTitle>
              <CardDescription>Keep track of all project activities and changes in one timeline.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Comprehensive audit logs</li>
                <li>• Real-time notifications</li>
                <li>• Activity filtering</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                Leverage AI to generate documentation, analyze commits, and boost productivity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Auto-generated docs</li>
                <li>• Commit analysis</li>
                <li>• Smart suggestions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <CardDescription>
              Join thousands of developer teams already using DevFlow to ship better software faster.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthButton />
            <p className="text-sm text-muted-foreground mt-4">Free to start • No credit card required</p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 DevFlow. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  )
}
