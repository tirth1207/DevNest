import { NewProjectForm } from "@/components/projects/new-project-form"

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground">Set up a new project to start collaborating with your team.</p>
      </div>

      <div className="max-w-2xl">
        <NewProjectForm />
      </div>
    </div>
  )
}
