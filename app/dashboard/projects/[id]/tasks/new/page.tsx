import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { NewTaskForm } from "@/components/tasks/new-task-form"

interface NewTaskPageProps {
  params: {
    id: string
  }
}

export default async function NewTaskPage({ params }: NewTaskPageProps) {
  const supabase = await createClient()

  // Verify user has access to this project
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

  // Get project members for assignee dropdown
  const { data: members } = await supabase
    .from("project_members")
    .select(`
      *,
      user:profiles(id, full_name, email, avatar_url)
    `)
    .eq("project_id", params.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
        <p className="text-muted-foreground">
          Add a new task to <span className="font-medium">{project.name}</span>
        </p>
      </div>

      <div className="max-w-2xl">
        <NewTaskForm projectId={params.id} members={members || []} />
      </div>
    </div>
  )
}
